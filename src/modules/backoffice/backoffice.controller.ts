import { AuthRequest } from "../../middleware/auth.middleware";
import { BackofficeService } from "./backoffice.service";
import { Response } from "express";

const service = new BackofficeService();

export class BackofficeController {
  constructor() {}

  async createCategory(req: AuthRequest, res: Response) {
    try {
      const category = await service.addCategory(req.body);
      if ("status" in category && category.status !== 200) {
        return res.status(category.status).json({ message: category.message });
      }
      return res.status(201).json(category);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao criar categoria" });
    }
  }

  async getAllCategories(req: AuthRequest, res: Response) {
    try {
      const categories = await service.getAllCategories();
      if ("status" in categories && categories.status !== 200) {
        return res
          .status(categories.status as number)
          .json({ message: categories.message as string });
      }
      return res.status(200).json(categories);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao buscar categorias" });
    }
  }

  async getCategoryById(req: AuthRequest, res: Response) {
    try {
      const { category_id } = req.params;
      const category = await service.getCategoryById(category_id as string);
      if (!category) {
        return res.status(404).json({ message: "Categoria não encontrada" });
      }
      if ("status" in category && category.status !== 200) {
        return res.status(category.status as number).json({ message: category.message as string });
      }
      return res.status(200).json(category);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao buscar categoria" });
    }
  }

  async updateCategory(req: AuthRequest, res: Response) {
    try {
      const { category_id } = req.params;
      const { name } = req.body;
      const category = await service.updateCategory(category_id as string, name);
      if ("status" in category && category.status !== 200) {
        return res.status(category.status as number).json({ message: category.message as string });
      }
      return res.status(200).json(category);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao atualizar categoria" });
    }
  }

  async toggleCategory(req: AuthRequest, res: Response) {
    try {
      const { name } = req.body;
      const category = await service.toggleCategory(name);
      if ("status" in category && category.status !== 200) {
        return res.status(category.status as number).json({ message: category.message as string });
      }
      return res.status(200).json(category);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao alternar categoria" });
    }
  }

  async getMetrics(req: AuthRequest, res: Response) {
    try {
      const metrics = await service.getAdminMetrics();
      return res.status(200).json(metrics);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao buscar métricas do admin" });
    }
  }

  async createPlan(req: AuthRequest, res: Response) {
    try {
      const plan = await service.addPlan(req.body);
      if ("status" in plan && plan.status !== 200) {
        return res.status(plan.status).json({ message: plan.message });
      }
      return res.status(201).json(plan);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao criar plano" });
    }
  }

  async getAllPlans(req: AuthRequest, res: Response) {
    try {
      const { page, per_page } = req.query;
      const plans = await service.getAllPlans(Number(page) || 1, Number(per_page) || 10);
      if ("status" in plans && plans.status !== 200) {
        return res.status(plans.status as number).json({ message: plans.message as string });
      }
      return res.status(200).json(plans);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao buscar planos" });
    }
  }

  async getPlanById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const plan = await service.getPlanById(id as string);
      if ("status" in plan && plan.status !== 200) {
        return res.status(plan.status as number).json({ message: plan.message as string });
      }
      return res.status(200).json(plan);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao buscar plano" });
    }
  }

  async updatePlan(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const plan = await service.updatePlan(id as string, req.body);
      if ("status" in plan && plan.status !== 200) {
        return res.status(plan.status as number).json({ message: plan.message as string });
      }
      return res.status(200).json(plan);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao atualizar plano" });
    }
  }

  async deletePlan(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const result = await service.deletePlan(id as string);
      if ("status" in result && result.status !== 200) {
        return res.status(result.status as number).json({ message: result.message as string });
      }
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao remover plano" });
    }
  }

  async blockUser(req: AuthRequest, res: Response) {
    try {
      const { user_id } = req.params;
      const result = await service.blockUser(user_id as string);
      if ("status" in result && result.status !== 200) {
        return res.status(result.status as number).json({ message: result.message as string });
      }
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao bloquear utilizador" });
    }
  }

  async unblockUser(req: AuthRequest, res: Response) {
    try {
      const { user_id } = req.params;
      const result = await service.unblockUser(user_id as string);
      if ("status" in result && result.status !== 200) {
        return res.status(result.status as number).json({ message: result.message as string });
      }
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao desbloquear utilizador" });
    }
  }
}
