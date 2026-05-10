import { AuthRequest } from "../../middleware/auth.middleware";
import { UserService } from "./user.service";
import { Response } from "express";

const userService = new UserService();
export class UserController {
  constructor() {}

  async createUser(req: AuthRequest, res: Response) {
    try {
      const user = await userService.createUser(req.body);
      if ("status" in user && user.status !== 200) {
        return res.status(user.status).json({ message: user.message });
      }
      return res.status(201).json(user);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Não foi possível criar a conta. Por favor, tente novamente." });
    }
  }

  async getAllUsers(req: AuthRequest, res: Response) {
    try {
      const { page, per_page, search } = req.query;
      const [users, totalUsers] = await userService.getAllusers(
        Number(page) || 1,
        Number(per_page) || 10,
        String(search) || "",
      );

      return res.status(200).json({
        data: users,
        meta: {
          total: totalUsers,
          page: Number(page) || 1,
          per_page: Number(per_page) || 10,
          total_pages: Math.ceil(totalUsers / (Number(per_page) || 10)),
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Não foi possível carregar a lista de utilizadores. Por favor, tente novamente." });
    }
  }

  async getUserById(req: AuthRequest, res: Response) {
    try {
      const { user_id } = req.params;
      const user = await userService.getUserById(user_id as string);
      if (!user) {
        return res.status(404).json({ message: "Não encontrámos nenhum utilizador com esse identificador." });
      }
      if ("status" in user && user.status !== 200) {
        return res.status(user.status).json({ message: user.message });
      }
      return res.status(200).json(user);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Não foi possível carregar os dados do utilizador. Por favor, tente novamente." });
    }
  }

  async getUserMe(req: AuthRequest, res: Response) {
    try {
      const user_id = req.userId;
      const user = await userService.getUserById(user_id as string);
      if (!user) {
        return res.status(404).json({ message: "Não foi possível encontrar a sua conta. Por favor, faça login novamente." });
      }
      if ("status" in user && user.status !== 200) {
        return res.status(user.status).json({ message: user.message });
      }
      return res.status(200).json(user);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Não foi possível carregar o seu perfil. Por favor, tente novamente." });
    }
  }

  async updateUser(req: AuthRequest, res: Response) {
    try {
      const { user_id } = req.params;
      const userData = req.body;
      const user = await userService.updateUser(user_id as string, userData);
      if (!user) {
        return res.status(404).json({ message: "Não encontrámos o utilizador que pretende atualizar." });
      }
      return res.status(200).json(user);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Não foi possível guardar as alterações. Por favor, tente novamente." });
    }
  }

  async deleteUser(req: AuthRequest, res: Response) {
    try {
      const { user_id } = req.params;
      const result = await userService.deleteUser(user_id as string);
      if (!result) {
        return res.status(404).json({ message: "Não encontrámos o utilizador que pretende remover." });
      }
      return res.status(200).json({ message: "Usuário deletado com sucesso" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Não foi possível remover a conta. Por favor, tente novamente." });
    }
  }
}
