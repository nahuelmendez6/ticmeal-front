import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportData {
  stockMovements: {
    id: number;
    createdAt: string;
    menuItem: { name: string } | null;
    ingredient: { name: string } | null;
    quantity: number;
    unit: string;
    movementType: string;
    reason: string;
    performedBy: { email: string; firstName?: string; lastName?: string; username?:string } | null;
  }[];
  mostConsumedItems: { name: string; totalConsumed: number }[];
  consumptionTrend: { date: string; itemName: string; totalConsumed: number }[];
  ingredientCostEvolution: { date: string; totalCost: number; details: { ingredientName: string; cost: number }[] }[];
  menuItemCostEvolution: { date: string; totalCost: number; details: { menuItemName: string; cost: number }[] }[];
  inventoryValue: { totalInventoryValue: number; categories: { category: string; totalValue: number; items: any[] }[] };
}

export const downloadGeneralReportPDF = async (
  startDate: string,
  endDate: string,
  token: string
) => {
  try {
    // Adjust the URL if your API is hosted elsewhere
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/reports/general-summary?startDate=${startDate}&endDate=${endDate}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener los datos del reporte');
    }

    const data: ReportData = await response.json();
    const doc = new jsPDF();

    // --- Encabezado del Reporte ---
    doc.setFontSize(18);
    doc.text('Reporte General de Gestión - TicMeal', 14, 20);
    
    doc.setFontSize(11);
    doc.text(`Período: ${startDate} al ${endDate}`, 14, 30);
    doc.text(`Fecha de generación: ${new Date().toLocaleString()}`, 14, 36);

    let finalY = 45;

    // --- Sección 1: Valor del Inventario ---
    if (data.inventoryValue) {
      doc.setFontSize(14);
      doc.text('1. Valor Actual del Inventario', 14, finalY);
      
      doc.setFontSize(11);
      doc.text(`Valor Total: $${data.inventoryValue.totalInventoryValue.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, 14, finalY + 8);

      const inventoryRows = data.inventoryValue.categories.map((cat: any) => [
        cat.category.replace(/_/g, ' '),
        `$${cat.totalValue.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
        cat.items.length
      ]);

      autoTable(doc, {
        startY: finalY + 12,
        head: [['Categoría', 'Valor Total', 'Cant. Items']],
        body: inventoryRows,
        theme: 'grid',
      });

      finalY = (doc as any).lastAutoTable.finalY + 15;
    }

    // --- Sección 2: Ítems Más Consumidos ---
    if (data.mostConsumedItems && data.mostConsumedItems.length > 0) {
      doc.setFontSize(14);
      doc.text('2. Top Ítems Más Consumidos', 14, finalY);

      const mostConsumedRows = data.mostConsumedItems.map((item) => [
        item.name,
        item.totalConsumed
      ]);

      autoTable(doc, {
        startY: finalY + 6,
        head: [['Ítem', 'Cantidad Consumida']],
        body: mostConsumedRows,
        theme: 'striped',
      });

      finalY = (doc as any).lastAutoTable.finalY + 15;
    }

    // --- Sección 3: Evolución de Costos (Ingredientes) ---
    if (data.ingredientCostEvolution && data.ingredientCostEvolution.length > 0) {
      // Verificar si necesitamos nueva página
      if (finalY > 250) {
        doc.addPage();
        finalY = 20;
      }

      doc.setFontSize(14);
      doc.text('3. Evolución de Costos (Ingredientes)', 14, finalY);

      const costRows = data.ingredientCostEvolution.map((day) => [
        day.date,
        `$${day.totalCost.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
        day.details.map((d: any) => `${d.ingredientName}: $${d.cost.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`).join(', ')
      ]);

      autoTable(doc, {
        startY: finalY + 6,
        head: [['Fecha', 'Costo Total', 'Detalle']],
        body: costRows,
        columnStyles: {
          2: { cellWidth: 100 }
        }
      });
    }

    // --- Sección 4: Evolución de Costos (Menú) ---
    if (data.menuItemCostEvolution && data.menuItemCostEvolution.length > 0) {
      if (finalY > 250) { doc.addPage(); finalY = 20; }

      doc.setFontSize(14);
      doc.text('4. Evolución de Costos (Menú)', 14, finalY);

      const menuCostRows = data.menuItemCostEvolution.map((day) => [
        day.date,
        `$${day.totalCost.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
        day.details.map((d) => `${d.menuItemName}: $${d.cost.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`).join(', ')
      ]);

      autoTable(doc, {
        startY: finalY + 6,
        head: [['Fecha', 'Costo Total', 'Detalle']],
        body: menuCostRows,
        columnStyles: {
          2: { cellWidth: 100 }
        }
      });

      finalY = (doc as any).lastAutoTable.finalY + 15;
    }

    // --- Sección 5: Movimientos de Stock ---
    if (data.stockMovements && data.stockMovements.length > 0) {
      if (finalY > 250) { doc.addPage(); finalY = 20; }

      doc.setFontSize(14);
      doc.text('5. Movimientos de Stock Recientes', 14, finalY);

      const stockRows = data.stockMovements.map((mov) => {
        const itemName = mov.menuItem ? mov.menuItem.name : (mov.ingredient ? mov.ingredient.name : 'Desconocido');
        const user = mov.performedBy ? (mov.performedBy.email || 'Usuario') : 'Sistema';
        const date = new Date(mov.createdAt).toLocaleDateString() + ' ' + new Date(mov.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
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
        startY: finalY + 6,
        head: [['Fecha', 'Ítem', 'Cant.', 'Tipo', 'Razón', 'Usuario']],
        body: stockRows,
        theme: 'grid',
        styles: { fontSize: 8 },
        columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 30 },
            4: { cellWidth: 30 },
            5: { cellWidth: 40 }
        }
      });
    }

    // --- Guardar PDF ---
    doc.save(`reporte_general_${startDate}_${endDate}.pdf`);

  } catch (error) {
    console.error('Error generando el reporte:', error);
    alert('Hubo un error al generar el reporte. Por favor verifique la conexión o intente nuevamente.');
  }
};