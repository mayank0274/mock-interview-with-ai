### Setup Locally

1. Clone this repo

2. Go to `/backend`

3. create .env file

```
cp .env.example .env
```

4. Install dependencies
   ( uv installation docs here [uv docs](https://docs.astral.sh/uv/getting-started/installation/))

```
uv sync
```

5. Install the Git pre-commit hooks

```
uv run pre-commit install
```

6. Run application via

```
--> start inngest dev server
npx --ignore-scripts=false inngest-cli@latest dev -u http://127.0.0.1:8000/api/inngest --no-discovery

INNGEST_DEV=1 uvivorn app.main:app --reload
```
