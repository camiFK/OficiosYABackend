const bcrypt = require("bcryptjs");
const {
  Usuario,
  Rol,
  Cliente,
  Prestador,
  Ubicacion,
  Categoria,
  PrestadorCategoria,
} = require("../Models/Index");
const { bcryptRounds } = require("../config/auth");

module.exports = {
  //Busca un usuario por correo
  async findByEmail(correo) {
    return await Usuario.findOne({
      where: { correo },
      include: [
        {
          model: Cliente,
          as: "cliente",
          attributes: ["id_cliente", "nombre_completo"],
        },
        {
          model: Prestador,
          as: "prestador",
          attributes: ["id_prestador", "nombre_completo", "telefono"],
        },
        {
          model: Rol,
          as: "rol",
          attributes: ["id_rol", "nombre"],
        },
      ],
    });
  },

  // Busca un usuario por ID con toda su información
  async findByIdWithDetails(id_usuario) {
    const usuario = await Usuario.findByPk(id_usuario, {
      include: [
        {
          model: Rol,
          as: "rol",
          attributes: ["id_rol", "nombre"],
        },
      ],
      attributes: { exclude: ["contrasena"] },
    });

    if (!usuario) return null;

    let userData = usuario.toJSON();

    // Obtener datos adicionales según el rol
    if (usuario.rol.nombre === "Cliente") {
      const cliente = await Cliente.findOne({
        where: { id_usuario },
        include: [
          {
            model: Ubicacion,
            as: "ubicacion",
          },
        ],
      });
      if (cliente) {
        userData.cliente = cliente;
      }
    } else if (usuario.rol.nombre === "Prestador") {
      const prestador = await Prestador.findOne({
        where: { id_usuario },
        include: [
          {
            model: Ubicacion,
            as: "ubicacion",
          },
        ],
      });
      if (prestador) {
        userData.prestador = prestador;
      }
    }

    return userData;
  },

  // Verifica si una contraseña coincide con el hash almacenado
  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  },

  async hashPassword(password) {
    return await bcrypt.hash(password, bcryptRounds);
  },

  // Crea un nuevo usuario con su rol específico
  async createUser(userData) {
    const {
      correo,
      contrasena,
      nombre_completo,
      id_ubicacion,
      id_cliente,
      id_prestador,
      id_rol,
      rol,
      telefono,
      descripcion,
      experiencia,
      categorias,
    } = userData;

    // Verificar que el id_rol sea válido
    const rolRecord = await Rol.findByPk(id_rol);
    if (!rolRecord) {
      throw new Error(`Rol con ID ${id_rol} no encontrado`);
    }

    // Hashear contraseña
    const hashedPassword = await this.hashPassword(contrasena);

    // Crear usuario
    const nuevoUsuario = await Usuario.create({
      correo,
      contrasena: hashedPassword,
      estado: "activo",
      id_rol: id_rol,
    });

    // Agregar el id_rol al objeto devuelto para uso inmediato
    nuevoUsuario.id_rol = id_rol;

    if (id_rol === 2) {
      // Cliente
      await Cliente.create({
        id_usuario: nuevoUsuario.id_usuario,
        nombre_completo,
        id_ubicacion,
      });
    } else if (id_rol === 3) {
      // Prestador
      const nuevoPrestador = await Prestador.create({
        id_usuario: nuevoUsuario.id_usuario,
        nombre_completo,
        telefono: telefono || null,
        id_ubicacion,
        descripcion: descripcion || null,
        experiencia: experiencia ? experiencia.toString() : null, // Convertir a STRING para la BD
      });

      // Asociar categorías si se proporcionaron
      if (categorias && categorias.length > 0) {
        for (const nombreCategoria of categorias) {
          // Buscar la categoría por nombre
          const categoria = await Categoria.findOne({
            where: { nombre: nombreCategoria },
          });

          if (categoria) {
            await PrestadorCategoria.create({
              id_prestador: nuevoPrestador.id_prestador,
              id_categoria: categoria.id_categoria,
            });
          }
        }
      }
    }

    return nuevoUsuario;
  },

  // Actualiza la contraseña de un usuario
  async updatePassword(id_usuario, nuevaContrasena) {
    const hashedPassword = await this.hashPassword(nuevaContrasena);

    await Usuario.update(
      { contrasena: hashedPassword },
      { where: { id_usuario } }
    );
  },

  // Obtiene los datos del usuario para el login según su rol
  async getUserDataForLogin(usuario) {
    let userData = {
      id_usuario: usuario.id_usuario,
      correo: usuario.correo,
      estado: usuario.estado,
      rol: usuario.rol.nombre,
    };

    let redirectUrl = "/";

    if (usuario.rol.nombre === "Cliente") {
      const cliente = await Cliente.findOne({
        where: { id_usuario: Number(usuario.id_usuario) },
        include: [
          {
            model: Ubicacion,
            as: "ubicacion",
            attributes: ["localidad", "provincia"],
          },
        ],
      });

      if (cliente) {
        userData.id_cliente = cliente.id_cliente;
        userData.nombre_completo = cliente.nombre_completo;
        userData.ubicacion = cliente.ubicacion;
      }

      redirectUrl = "/panel/solicitante";
    } else if (usuario.rol.nombre === "Prestador") {
      const prestador = await Prestador.findOne({
        where: { id_usuario: Number(usuario.id_usuario) },
        include: [
          {
            model: Ubicacion,
            as: "ubicacion",
            attributes: ["localidad", "provincia"],
          },
        ],
      });

      if (prestador) {
        userData.id_prestador = prestador.id_prestador;
        userData.nombre_completo = prestador.nombre_completo;
        userData.telefono = prestador.telefono;
        userData.ubicacion = prestador.ubicacion;
      }

      redirectUrl = "/panel/prestador";
    } else if (usuario.rol.nombre === "Administrador") {
      redirectUrl = "/panel/administrador";
    }

    return { userData, redirectUrl };
  },

  // Actualiza los datos del perfil de un usuario
  async updateUserProfile(id_usuario, updateData) {
    const {
      nombre_completo,
      telefono,
      id_ubicacion,
      descripcion,
      experiencia,
      categorias,
    } = updateData;

    try {
      // Actualizar datos del usuario principal si es necesario
      const usuario = await Usuario.findByPk(id_usuario, {
        include: [
          {
            model: Rol,
            as: "rol",
          },
        ],
      });

      if (!usuario) {
        throw new Error("Usuario no encontrado");
      }

      // Actualizar según el rol del usuario
      if (usuario.rol.nombre === "Cliente") {
        const cliente = await Cliente.findOne({ where: { id_usuario } });
        if (cliente) {
          await cliente.update({
            nombre_completo: nombre_completo || cliente.nombre_completo,
            id_ubicacion: id_ubicacion || cliente.id_ubicacion,
          });
        }
      } else if (usuario.rol.nombre === "Prestador") {
        const prestador = await Prestador.findOne({ where: { id_usuario } });
        if (prestador) {
          await prestador.update({
            nombre_completo: nombre_completo || prestador.nombre_completo,
            telefono: telefono || prestador.telefono,
            id_ubicacion: id_ubicacion || prestador.id_ubicacion,
            descripcion:
              descripcion !== undefined ? descripcion : prestador.descripcion,
            experiencia:
              experiencia !== undefined
                ? experiencia.toString()
                : prestador.experiencia,
          });

          // Actualizar categorías si se proporcionaron
          if (categorias && Array.isArray(categorias)) {
            // Eliminar categorías existentes
            await PrestadorCategoria.destroy({
              where: { id_prestador: prestador.id_prestador },
            });

            // Agregar nuevas categorías
            for (const nombreCategoria of categorias) {
              const categoria = await Categoria.findOne({
                where: { nombre: nombreCategoria },
              });
              if (categoria) {
                await PrestadorCategoria.create({
                  id_prestador: prestador.id_prestador,
                  id_categoria: categoria.id_categoria,
                });
              }
            }
          }
        }
      }

      return await this.findByIdWithDetails(id_usuario);
    } catch (error) {
      console.error("Error actualizando perfil de usuario:", error);
      throw error;
    }
  },

  // Verifica si un usuario puede ser eliminado
  async canUserBeDeleted(id_usuario) {
    try {
      const usuario = await Usuario.findByPk(id_usuario, {
        include: [
          {
            model: Rol,
            as: "rol",
          },
        ],
      });

      if (!usuario) {
        return { canDelete: false, reason: "Usuario no encontrado" };
      }

      // Verificar si es prestador con solicitudes activas, etc.
      if (usuario.rol.nombre === "Prestador") {
        const { SolicitudPrestador, Presupuesto } = require("../Models/Index");

        const solicitudesActivas = await SolicitudPrestador.count({
          where: {
            id_prestador: usuario.prestador?.id_prestador,
            estado: ["pendiente", "en_proceso"],
          },
        });

        if (solicitudesActivas > 0) {
          return {
            canDelete: false,
            reason: "El prestador tiene solicitudes activas",
          };
        }
      }

      return { canDelete: true };
    } catch (error) {
      console.error(
        "Error verificando si el usuario puede ser eliminado:",
        error
      );
      return { canDelete: false, reason: "Error interno" };
    }
  },

  // Desactiva un usuario
  async deactivateUser(id_usuario) {
    try {
      const [updatedRows] = await Usuario.update(
        { estado: "inactivo" },
        { where: { id_usuario } }
      );

      return updatedRows > 0;
    } catch (error) {
      console.error("Error desactivando usuario:", error);
      throw error;
    }
  },

  // Reactiva un usuario
  async reactivateUser(id_usuario) {
    try {
      const [updatedRows] = await Usuario.update(
        { estado: "activo" },
        { where: { id_usuario } }
      );

      return updatedRows > 0;
    } catch (error) {
      console.error("Error reactivando usuario:", error);
      throw error;
    }
  },

  // Busca usuarios con filtros (para admin)
  async searchUsers(filters = {}) {
    try {
      const { rol, estado, correo, limite = 50, pagina = 1 } = filters;

      const whereClause = {};
      const includeClause = [
        {
          model: Rol,
          as: "rol",
          attributes: ["id_rol", "nombre"],
        },
      ];

      if (rol) {
        includeClause[0].where = { nombre: rol };
      }

      if (estado) {
        whereClause.estado = estado;
      }

      if (correo) {
        const { Op } = require("sequelize");
        whereClause.correo = {
          [Op.like]: `%${correo}%`,
        };
      }

      const offset = (pagina - 1) * limite;

      const usuarios = await Usuario.findAndCountAll({
        where: whereClause,
        include: includeClause,
        attributes: { exclude: ["contrasena"] },
        limit: parseInt(limite),
        offset: offset,
        order: [["createdAt", "DESC"]],
      });

      return {
        usuarios: usuarios.rows,
        total: usuarios.count,
        pagina: parseInt(pagina),
        totalPaginas: Math.ceil(usuarios.count / limite),
      };
    } catch (error) {
      console.error("Error buscando usuarios:", error);
      throw error;
    }
  },
};
