const BASE_URL = 'http://localhost:3000';

export interface CreateIngredientDto {
  name: string;
  quantityInStock?: number;
  unit: "kg" | "g" | "l" | "ml" | "unit";
  cost?: number;
  costType?: "per_unit" | "per_kg" | "per_lt";
  description?: string;
  category?: number;
  minStock?: number;
}

export interface SystemIngredient extends CreateIngredientDto {
  id: number;
}


export const ingredientsService = {
  async getAll(token: string) {
    const res = await fetch(`${BASE_URL}/ingredients`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      throw new Error('Error al obtener los ingredientes');
    }
    return res.json();
  },

  async create(token: string, dto: CreateIngredientDto) {
    const body: any = { ...dto };

    // 🔄 Convertir strings numéricos a number
    const numericFields = ["quantityInStock", "cost", "minStock"];
    numericFields.forEach((field) => {
      if (body[field] === "" || body[field] === null || body[field] === undefined) {
        delete body[field]; // evitar mandar vacíos
      } else if (typeof body[field] === "string") {
        const num = Number(body[field]);
        if (!isNaN(num)) {
          body[field] = num;
        }
      }
    });

    // Convertir "" a null para campos de texto opcionales
    Object.keys(body).forEach((key) => {
      if (body[key] === "") body[key] = null;
    });

    // category debe ser número o null
    if (typeof body.category === "string") {
      const num = Number(body.category);
      if (!isNaN(num)) {
        body.category = num;
      } else {
        body.category = null;
      }
    }

    const res = await fetch(`${BASE_URL}/ingredients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("CREATE error:", errorText);
      throw new Error("Error al crear ingrediente");
    }

    return res.json();
  },


  async update(token: string, id: number, dto: CreateIngredientDto) {
    const body: any = { ...dto };

    // 🚫 Nunca enviar id
    delete body.id;

    // 🔄 Convertir strings numéricos a number
    const numericFields = ["quantityInStock", "cost", "minStock"];
    numericFields.forEach((field) => {
      if (body[field] === "" || body[field] === null || body[field] === undefined) {
        delete body[field]; // no mandar vacíos
      } else if (typeof body[field] === "string") {
        const num = Number(body[field]);
        if (!isNaN(num)) {
          body[field] = num;
        }
      }
    });

    // Convertir "" a null para campos opcionales string
    Object.keys(body).forEach((key) => {
      if (body[key] === "") body[key] = null;
    });

    // categoryId → category
    if (body.categoryId !== undefined) {
      body.category = body.categoryId;
      delete body.categoryId;
    }

    const res = await fetch(`${BASE_URL}/ingredients/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("PATCH error:", errorText);
      throw new Error("Error al actualizar ingrediente");
    }

    return res.json();
  }



};
