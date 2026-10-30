# Como publicar o SGS

O código já está no GitHub:
**https://github.com/isaquebrito6-cmyk/Projeto-sgs-**

## Opção recomendada: Vercel (gratuito e ideal para Next.js)

### Passo a passo (cerca de 3 minutos)

1. Acesse **https://vercel.com** e entre com a conta do **GitHub** (`isaquebrito6-cmyk`)
2. Clique em **Add New… → Project**
3. Importe o repositório **Projeto-sgs-**
4. Em **Environment Variables**, adicione:

| Nome | Valor |
|------|--------|
| `DATABASE_URL` | `file:./dev.db` (só para teste rápido) **ou** URL Postgres |
| `AUTH_SECRET` | gere com: `openssl rand -base64 32` |
| `AUTH_URL` | a URL que a Vercel mostrar (ex: `https://projeto-sgs.vercel.app`) |

5. Clique em **Deploy**

Após o deploy, a Vercel gera um link tipo:
`https://projeto-sgs-xxxx.vercel.app`

### Banco de dados em produção

SQLite (`file:./dev.db`) **não é ideal** na Vercel (sistema de arquivos efêmero).

Para produção de verdade, use um destes (gratuitos para começar):

- **Vercel Postgres** (pelo painel da Vercel)
- **Supabase** (https://supabase.com) → Postgres gratuito
- **Neon** (https://neon.tech) → Postgres gratuito

Depois troque no `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

E rode localmente:

```bash
npx prisma db push
npx prisma db seed
```

Na Vercel, use a connection string Postgres nas variáveis de ambiente.

### Seed do admin após o primeiro deploy

No painel da Vercel → projeto → **Settings** não roda seed automático.
Rode uma vez localmente apontando para o banco de produção, ou crie o usuário admin pela interface depois.

---

## Rodar só no seu computador (ver agora)

```bash
git clone https://github.com/isaquebrito6-cmyk/Projeto-sgs-.git
cd Projeto-sgs-
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

Abra: **http://localhost:3000**  
Login: `admin@sgs.local` / `admin123`

---

## GitHub Pages?

**Não** é adequado para este projeto (Next.js com autenticação, banco e Server Actions). Use Vercel.
