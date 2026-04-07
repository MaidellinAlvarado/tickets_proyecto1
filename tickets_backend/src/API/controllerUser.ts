import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt'; 

const prisma = new PrismaClient();

export class UserController {
  async crear(req: Request, res: Response) {
    try {
      const { name, email, role, password } = req.body;
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      //  Creamos el usuario en la DB
      const nuevoUsuario = await prisma.user.create({
        data: {
          full_name: name,
          email: email,
          password_hash: hashedPassword, 
          role: role === 'L2' ? 'l2_agent' : 'l1_agent' 
        }
      });

      res.status(201).json({
        success: true,
        message: "Usuario creado con éxito",
        data: { id: nuevoUsuario.user_id, email: nuevoUsuario.email }
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Error al crear el usuario. Revisa si el email ya existe."
      });
    }
  }


  async listar(req: Request, res: Response) {
  try {
    const usuarios = await prisma.user.findMany();
    res.status(200).json({ success: true, data: usuarios });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener usuarios" });
  }
}
}