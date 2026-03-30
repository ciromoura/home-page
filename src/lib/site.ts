/** URL base do site em produção.
 *  Defina a variável de ambiente NEXT_PUBLIC_SITE_URL no seu host (Vercel, etc.)
 *  para sobrescrever o valor padrão.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ciromoura.dev'
