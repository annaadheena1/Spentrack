
  # Expense Monitoring App

  This is a code bundle for Expense Monitoring App. The original project is available at https://www.figma.com/design/Tm1zL39spyIPJuObtLvl40/Expense-Monitoring-App.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Supabase setup

  1. Copy `.env.example` to `.env`.
  2. Replace values with your Supabase project URL and anon key.
  3. Restart the Vite dev server after changing `.env` values.

  SQL table used for simulated SMS storage:

  ```sql
  create table if not exists public.simulated_sms (
    id bigint generated always as identity primary key,
    user_id text not null,
    raw_text text not null,
    amount numeric,
    merchant text,
    app_name text,
    avg_spend numeric,
    received_at timestamptz not null default now()
  );
  ```

  ## Secret Protection With GitGuardian

  This repo is configured to use GitGuardian to help catch leaked secrets before they are committed or merged.

  Local setup:

  1. Install `ggshield`.
  2. Export your GitGuardian API key: `export GITGUARDIAN_API_KEY=your_gitguardian_api_key`.
  3. Install the local pre-commit hook: `bash scripts/install-gitguardian-hook.sh`.
  4. Run a manual scan any time with `npm run secrets:scan`.

  GitHub Actions setup:

  1. Add a repository secret named `GITGUARDIAN_API_KEY` in GitHub.
  2. The workflow in `.github/workflows/gitguardian.yml` will scan pushes and pull requests automatically.

  Notes:

  - Keep real keys only in ignored local env files such as `.env`.
  - `.env.example` must stay placeholder-only so sample config never exposes live credentials.
  