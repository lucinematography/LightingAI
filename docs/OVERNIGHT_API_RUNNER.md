# LightingAI overnight API runner

Ovo je bezbedna prva faza automatizacije: racunar moze satima da obradjuje unapred zadatu listu zadataka preko OpenAI Responses API-ja, bez potrebe da korisnik kuca "nastavi".

## Sta radi

- cita zadatke iz `automation/tasks.json`
- izvrsava ih redom
- cuva svaki rezultat u `.lightingai_automation/results/`
- pamti zavrsene zadatke u `.lightingai_automation/state.json`
- automatski ponavlja privremeno neuspele API pozive
- moze bezbedno da se zaustavi kreiranjem fajla `.lightingai_automation/STOP`
- ne menja automatski stabilni `main` i ne pravi GitHub izmene

## Windows priprema

1. Instalirati Python 3.11+.
2. U terminalu u korenu projekta pokrenuti:

```
py -m pip install --upgrade openai
```

3. Postaviti API kljuc i model samo kao promenljive okruzenja. Ne upisivati kljuc u fajl niti u GitHub:

PowerShell:

```
$env:OPENAI_API_KEY="vas-kljuc"
$env:OPENAI_MODEL="model-koji-imate-na-API-nalogu"
```

4. Prvo uraditi probu bez trosenja API poziva:

```
py scripts/overnight_runner.py --dry-run
```

5. Zatim pokrenuti jedan pravi zadatak:

```
py scripts/overnight_runner.py --max-tasks 1
```

6. Kada je sve provereno, nocni rad:

```
py scripts/overnight_runner.py
```

## Pravilo za LightingAI

Za sada runner samo proizvodi rezultate za pregled. Sledeca faza moze da dobije kontrolisano pisanje u posebnu Git granu, pokretanje testova i PR, ali ne treba joj dozvoliti direktan upis na `main` bez CI provere.
