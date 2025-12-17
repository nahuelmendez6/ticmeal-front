import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Define a more accurate and complete type for the API response
interface ReportAPIResponse {
  meta: {
    generatedAt: string;
    period: {
      startDate: string;
      endDate: string;
    };
  };
  data: {
    stockMovements?: {
      id: number;
      createdAt: string;
      menuItem: { name: string } | null;
      ingredient: { name: string } | null;
      quantity: number;
      unit: string;
      movementType: string;
      reason: string;
      performedBy: { email: string; firstName?: string; lastName?: string; username?: string } | null;
    }[];
    mostConsumedItems?: { name: string; totalConsumed: number }[];
    consumptionTrend?: { date: string; itemName: string; totalConsumed: number }[];
    ingredientCostEvolution?: { date: string; totalCost: number; details: { ingredientName: string; cost: number }[] }[];
    menuItemCostEvolution?: { date: string; totalCost: number; details: { menuItemName: string; cost: number }[] }[];
    inventoryValue?: { totalInventoryValue: number; categories: { category: string; totalValue: number; items: any[] }[] };
    consumptionVsCost?: {
      summary: {
        totalPeriodCost: number;
        totalItemsServed: number;
      };
      items: {
        name: string;
        unitCost: number;
        totalConsumed: number;
        totalCost: number;
        impactPercentage: number;
      }[];
    };
    theoreticalMenuCost?: {
      menuItemName: string;
      theoreticalCost: number;
    }[];
    detailedCostAnalysis?: {
      date: string;
      totalDailyCost: number;
      shifts: {
        shiftName: string;
        totalShiftCost: number;
        items: {
          menuItemName: string;
          quantity: number;
          unitCost: number;
          totalCost: number;
        }[];
      }[];
    }[];
  };
}

// Helper to format currency
const formatCurrency = (value: number) => {
  return `$${(value || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const downloadGeneralReportPDF = async (
  startDate: string,
  endDate: string,
  token: string
) => {
  try {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/reports/general-summary?startDate=${startDate}&endDate=${endDate}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error al obtener los datos del reporte' }));
      throw new Error(errorData.message || 'No se pudo generar el reporte.');
    }

    const apiResponse: ReportAPIResponse = await response.json();
    const { data, meta } = apiResponse;
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4'
    });

    let finalY = 20; // Initial Y position

    // --- 1. HEADER ---
    doc.setFontSize(20);
    doc.text('Reporte General de Gestión', 14, finalY);
    finalY += 10;
    
    doc.setFontSize(12);
    doc.text(`Período: ${meta.period.startDate} al ${meta.period.endDate}`, 14, finalY);
    finalY += 6;
    doc.text(`Fecha de generación: ${new Date(meta.generatedAt).toLocaleString('es-AR')}`, 14, finalY);
    finalY += 15;

    // --- 2. KPIS ---
    if (data.inventoryValue || data.consumptionVsCost) {
      doc.setFontSize(16);
      doc.text('Indicadores Clave (KPIs)', 14, finalY);
      finalY += 8;

      const kpis = [];
      if (data.inventoryValue) {
        kpis.push({ title: 'Valor Total de Inventario', value: formatCurrency(data.inventoryValue.totalInventoryValue) });
      }
      if (data.consumptionVsCost) {
        kpis.push({ title: 'Costo Total del Período (CMV)', value: formatCurrency(data.consumptionVsCost.summary.totalPeriodCost) });
        kpis.push({ title: 'Total de Ítems Servidos', value: data.consumptionVsCost.summary.totalItemsServed.toString() });
      }

      // Render KPIs in cards
      const cardWidth = (doc.internal.pageSize.getWidth() - 28 - (kpis.length - 1) * 5) / kpis.length;
      const cardHeight = 20;
      let currentX = 14;

      kpis.forEach(kpi => {
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(currentX, finalY, cardWidth, cardHeight, 3, 3, 'F');
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(kpi.title, currentX + cardWidth / 2, finalY + 7, { align: 'center' });
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.setFont('helvetica', 'bold');
        doc.text(kpi.value, currentX + cardWidth / 2, finalY + 15, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        currentX += cardWidth + 5;
      });

      finalY += cardHeight + 15;
    }

    // --- 3. INVENTORY VALUE BREAKDOWN ---
    if (data.inventoryValue && data.inventoryValue.categories.length > 0) {
      doc.setFontSize(16);
      doc.text('Desglose de Valor de Inventario', 14, finalY);
      finalY += 8;

      const inventoryRows = data.inventoryValue.categories.map((cat) => [
        cat.category.replace(/_/g, ' '),
        formatCurrency(cat.totalValue),
        cat.items.length.toString()
      ]);

      autoTable(doc, {
        startY: finalY,
        head: [['Categoría', 'Valor Total', 'N° de Ítems']],
        body: inventoryRows,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
      });

      finalY = (doc as any).lastAutoTable.finalY + 15;
    }

    // --- 4. CONSUMPTION VS COST (PARETO) ---
    if (data.consumptionVsCost && data.consumptionVsCost.items.length > 0) {
      if (finalY > 250) { doc.addPage(); finalY = 20; }
      doc.setFontSize(16);
      doc.text('Análisis de Costo vs. Consumo (Pareto)', 14, finalY);
      finalY += 8;

      const consumptionCostRows = data.consumptionVsCost.items
        .sort((a, b) => b.impactPercentage - a.impactPercentage) // Sort by impact
        .map((item) => [
          item.name,
          item.totalConsumed,
          formatCurrency(item.unitCost),
          formatCurrency(item.totalCost),
          `${item.impactPercentage.toFixed(2)}%`
        ]);

      autoTable(doc, {
        startY: finalY,
        head: [['Ítem', 'Consumo (Uds)', 'Costo Unit.', 'Costo Total', 'Impacto (%)']],
        body: consumptionCostRows,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] },
      });

      finalY = (doc as any).lastAutoTable.finalY + 15;
    }

    // --- 5. MOST CONSUMED ITEMS ---
    if (data.mostConsumedItems && data.mostConsumedItems.length > 0) {
      if (finalY > 250) { doc.addPage(); finalY = 20; }
      doc.setFontSize(16);
      doc.text('Ítems Más Populares (Top Consumidos)', 14, finalY);
      finalY += 8;

      const mostConsumedRows = data.mostConsumedItems.map((item) => [
        item.name,
        item.totalConsumed
      ]);

      autoTable(doc, {
        startY: finalY,
        head: [['Ítem', 'Cantidad Consumida']],
        body: mostConsumedRows,
        theme: 'striped',
        headStyles: { fillColor: [22, 160, 133] },
        didDrawCell: (data) => {
            // This is a placeholder for a bar chart. We draw a simple bar.
            if (data.column.index === 1 && data.cell.section === 'body' && apiResponse.data.mostConsumedItems) {
                const maxConsumed = Math.max(...apiResponse.data.mostConsumedItems.map(i => i.totalConsumed));
                const barWidth = (data.cell.raw as number / maxConsumed) * (data.column.width - 10);
                doc.setFillColor(39, 174, 96);
                doc.rect(data.cell.x + 2, data.cell.y + 2, barWidth, data.cell.height - 4, 'F');
            }
        }
      });

      finalY = (doc as any).lastAutoTable.finalY + 15;
    }

    // --- 6. THEORETICAL MENU COST ---
    if (data.theoreticalMenuCost && data.theoreticalMenuCost.length > 0) {
      if (finalY > 250) { doc.addPage(); finalY = 20; }
      doc.setFontSize(16);
      doc.text('Costo Teórico de Recetas', 14, finalY);
      finalY += 8;

      const theoreticalCostRows = data.theoreticalMenuCost.map((item) => [
        item.menuItemName,
        formatCurrency(item.theoreticalCost)
      ]);

      autoTable(doc, {
        startY: finalY,
        head: [['Ítem del Menú', 'Costo Teórico']],
        body: theoreticalCostRows,
        theme: 'grid',
        headStyles: { fillColor: [142, 68, 173] },
      });

      finalY = (doc as any).lastAutoTable.finalY + 15;
    }

    // --- 7. TOTAL SHIFT COST SUMMARY (ENTIRE PERIOD) ---
    if (data.detailedCostAnalysis && data.detailedCostAnalysis.length > 0) {
      if (finalY > 250) { doc.addPage(); finalY = 20; }

      const shiftCostSummary = new Map<string, number>();
      data.detailedCostAnalysis.forEach(day => {
        day.shifts.forEach(shift => {
          const currentTotal = shiftCostSummary.get(shift.shiftName) || 0;
          shiftCostSummary.set(shift.shiftName, currentTotal + shift.totalShiftCost);
        });
      });

      if (shiftCostSummary.size > 0) {
        doc.setFontSize(16);
        doc.text('Resumen de Costos por Turno (Período Total)', 14, finalY);
        finalY += 8;

        const summaryRows = Array.from(shiftCostSummary.entries())
          .sort((a, b) => b[1] - a[1]) // Sort by total cost descending
          .map(([shiftName, totalCost]) => [
            shiftName,
            formatCurrency(totalCost)
          ]);

        autoTable(doc, {
          startY: finalY,
          head: [['Turno', 'Costo Total del Período']],
          body: summaryRows,
          theme: 'striped',
          headStyles: { fillColor: [231, 76, 60] }, // Red color for emphasis
        });
        finalY = (doc as any).lastAutoTable.finalY + 15;
      }
    }

    // --- 8. DETAILED COST ANALYSIS (BY DAY & SHIFT) ---
    if (data.detailedCostAnalysis && data.detailedCostAnalysis.length > 0) {
      if (finalY > 250) { doc.addPage(); finalY = 20; }
      
      // Section Title
      doc.setFontSize(16);
      doc.setTextColor(0); // Black
      doc.text('Análisis Detallado de Costos (Por Día y Turno)', 14, finalY);
      finalY += 10;

      data.detailedCostAnalysis.forEach((dayData) => {
        // Ensure we have space for the day header
        if (finalY > 260) { doc.addPage(); finalY = 20; }

        // Day Header
        doc.setFontSize(14);
        doc.setTextColor(44, 62, 80); // Dark Blue
        doc.setFont('helvetica', 'bold');
        // Format date manually to avoid timezone issues: YYYY-MM-DD -> DD/MM/YYYY
        const [year, month, day] = dayData.date.split('-');
        const formattedDate = `${day}/${month}/${year}`;
        
        doc.text(`Fecha: ${formattedDate} - Total Día: ${formatCurrency(dayData.totalDailyCost)}`, 14, finalY);
        finalY += 8;

        dayData.shifts.forEach((shift) => {
            // Ensure space for shift header and at least one row
            if (finalY > 250) { doc.addPage(); finalY = 20; }

            doc.setFontSize(12);
            doc.setTextColor(100); // Grey
            doc.setFont('helvetica', 'bolditalic');
            doc.text(`Turno: ${shift.shiftName} - Total: ${formatCurrency(shift.totalShiftCost)}`, 14, finalY);
            
            const shiftRows = shift.items.map(item => [
                item.menuItemName,
                item.quantity.toString(),
                formatCurrency(item.unitCost),
                formatCurrency(item.totalCost)
            ]);

            autoTable(doc, {
                startY: finalY + 2,
                head: [['Ítem', 'Cant.', 'Costo Unit.', 'Costo Total']],
                body: shiftRows,
                theme: 'grid',
                headStyles: { fillColor: [52, 73, 94], fontSize: 10 },
                styles: { fontSize: 9, cellPadding: 1 },
                columnStyles: {
                    0: { cellWidth: 'auto' },
                    1: { cellWidth: 20, halign: 'center' },
                    2: { cellWidth: 30, halign: 'right' },
                    3: { cellWidth: 30, halign: 'right' }
                },
                margin: { left: 14, right: 14 }
            });

            finalY = (doc as any).lastAutoTable.finalY + 8;
        });
        
        finalY += 5; // Space between days
      });
      
      // Reset font and color
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0);
    }

    // --- 9. STOCK MOVEMENTS (AUDIT) ---
    if (data.stockMovements && data.stockMovements.length > 0) {
      doc.addPage(); // New page for the audit trail
      finalY = 20;
      doc.setFontSize(16);
      doc.text('Auditoría de Movimientos de Stock', 14, finalY);
      finalY += 8;

      const stockRows = data.stockMovements.map((mov) => {
        const itemName = mov.menuItem?.name || mov.ingredient?.name || 'N/A';
        const user = mov.performedBy?.email || 'Sistema';
        const date = new Date(mov.createdAt).toLocaleString('es-AR');
        
        return [
            date,
            itemName,
            `${mov.quantity} ${mov.unit}`,
            mov.movementType === 'in' ? 'Entrada' : 'Salida',
            mov.reason,
            user
        ];
      });

      autoTable(doc, {
        startY: finalY,
        head: [['Fecha y Hora', 'Ítem', 'Cantidad', 'Tipo', 'Razón', 'Usuario']],
        body: stockRows,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 1.5 },
        headStyles: { fillColor: [44, 62, 80] },
        columnStyles: {
            0: { cellWidth: 28 },
            1: { cellWidth: 40 },
            2: { cellWidth: 15 },
            3: { cellWidth: 15 },
            4: { cellWidth: 30 },
            5: { cellWidth: 'auto' }
        }
      });
    }

    // --- SAVE PDF ---
    doc.save(`reporte_general_${startDate}_a_${endDate}.pdf`);

  } catch (error) {
    console.error('Error generando el reporte:', error);
    alert('Hubo un error al generar el reporte. Por favor verifique la conexión o intente nuevamente.');
  }
};