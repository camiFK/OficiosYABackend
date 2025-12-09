/**
 * @swagger
 * components:
 *   schemas:
 *     AuthLoginRequest:
 *       type: object
 *       required:
 *         - correo
 *         - contrasena
 *       properties:
 *         correo:
 *           type: string
 *           format: email
 *           example: usuario@oficiosya.com
 *         contrasena:
 *           type: string
 *           format: password
 *           example: Password123!
 *     AuthRegisterRequest:
 *       type: object
 *       required:
 *         - correo
 *         - contrasena
 *         - confirmar_contrasena
 *         - nombre_completo
 *       properties:
 *         correo:
 *           type: string
 *           format: email
 *           example: nuevo@oficiosya.com
 *         contrasena:
 *           type: string
 *           format: password
 *           description: Debe cumplir las reglas de complejidad.
 *           example: Password123!
 *         confirmar_contrasena:
 *           type: string
 *           format: password
 *           example: Password123!
 *         nombre_completo:
 *           type: string
 *           example: Ana Pérez
 *         id_rol:
 *           type: integer
 *           description: 2 = Cliente, 3 = Prestador
 *           example: 2
 *     ForgotPasswordRequest:
 *       type: object
 *       required:
 *         - correo
 *       properties:
 *         correo:
 *           type: string
 *           format: email
 *           example: usuario@oficiosya.com
 *     ResetPasswordRequest:
 *       type: object
 *       required:
 *         - token
 *         - nueva_contrasena
 *       properties:
 *         token:
 *           type: string
 *           example: reset-token-uuid
 *         nueva_contrasena:
 *           type: string
 *           format: password
 *           example: NuevaPassword123!
 *     ValidateResetTokenRequest:
 *       type: object
 *       required:
 *         - token
 *       properties:
 *         token:
 *           type: string
 *           example: reset-token-uuid
 *     AuthResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT de sesión
 *         usuario:
 *           type: object
 *           description: Datos básicos del usuario autenticado
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: Datos de entrada inválidos
 *         message:
 *           type: string
 *           example: Complete todos los campos obligatorios
 */
