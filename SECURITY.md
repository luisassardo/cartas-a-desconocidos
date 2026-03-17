# Política de Seguridad

## Versiones soportadas

| Versión | Soportada |
|---------|-----------|
| 1.x     | ✅        |

## Reportar una vulnerabilidad

Si encuentras una vulnerabilidad de seguridad, por favor **no abras un issue público**.

En su lugar, envía un reporte privado a través de la pestaña **Security** del repositorio en GitHub (Security Advisories), o contacta directamente al mantenedor.

### Qué incluir en tu reporte

- Descripción de la vulnerabilidad
- Pasos para reproducirla
- Impacto potencial
- Sugerencia de corrección (si tienes una)

### Tiempo de respuesta

- **Acuse de recibo:** 48 horas
- **Evaluación inicial:** 1 semana
- **Corrección:** dependiendo de la severidad

## Medidas de seguridad implementadas

- Encriptación AES-256-CBC para datos personales
- Prepared statements (prevención de SQL injection)
- Cookies httpOnly con SameSite=Strict
- Validación de tipos de archivo en uploads
- Límites de tamaño de archivo

## Recomendaciones para producción

- Usar HTTPS obligatoriamente (nginx + Certbot)
- Cambiar **todas** las claves por defecto en `.env`
- Configurar rate limiting
- Restringir CORS al dominio específico
- Configurar backups automáticos de la base de datos
- Usar un firewall (ufw, security groups)
