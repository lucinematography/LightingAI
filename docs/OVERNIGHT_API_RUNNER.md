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
$env:OPENAI_API_KEY = Read-Host "Unesite OpenAI API kljuc"
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


## Faza 2: kontrolisani Git rad

Nova skripta `scripts/overnight_git_runner.py` moze da uzima unapred pripremljene zadatke iz `automation/git_tasks.json` i za svaki zadatak:

- polazi iskljucivo sa lokalnog `main`
- pravi posebnu granu `automation/<task-id>`
- dozvoljava izmenu samo fajlova navedenih u `allowed_paths`
- pokrece samo unapred odobrene test alias-e
- prekida i vraca granu ako model pokusa da menja drugi fajl
- pravi commit i push samo ako testovi prodju
- otvara PR preko GitHub CLI komande `gh pr create`
- nikada automatski ne spaja PR u `main`

Dodatni lokalni preduslovi za fazu 2:

```
git --version
gh --version
gh auth status
```

Prvo pokretanje treba uraditi kao suvu probu:

```
py scripts/overnight_git_runner.py --dry-run
```

Zatim jedan kontrolisani zadatak:

```
py scripts/overnight_git_runner.py --max-tasks 1
```

Tek posle provere rezultata moze se ostaviti da obradi celu unapred pripremljenu listu.


## Faza 3: pracenje CI i kontrolisana popravka

Posle otvaranja PR-a runner sada prati GitHub Actions provere za tu automation granu.

- ako CI prodje, zadatak se oznacava kao zavrsen, a PR ostaje otvoren za pregled
- ako CI padne, runner cita samo neuspele GitHub Actions logove
- model moze da pokusa malu popravku samo unutar istog `allowed_paths` skupa
- lokalni testovi se ponovo pokrecu pre svakog push-a
- broj automatskih CI popravki je ogranicen preko `max_ci_repairs` i tvrdo ogranicen na najvise 2
- podrazumevana vrednost je 1 popravka
- ako popravka nije bezbedna ili CI i dalje pada, zadatak se oznacava za rucnu proveru
- runner nikada ne menja niti automatski spaja `main`

Primer politike u zadatku:

```json
{
  "ci_timeout_minutes": 45,
  "max_ci_repairs": 1
}
```

Za nocni rad racunar mora ostati ukljucen, GitHub CLI mora biti prijavljen, a terminal u kome je runner pokrenut mora ostati aktivan.


## Faza 4: produkcioni red zadataka i preflight

Pre nocnog rada pokreni proveru okruzenja:

```
py scripts/overnight_preflight.py
```

Preflight proverava Python 3.11+, Git, GitHub CLI prijavu, cist radni direktorijum i da li su `OPENAI_API_KEY` i `OPENAI_MODEL` postavljeni. Ne trosi API pozive.

Za bezbedan prvi pravi nocni rad dodat je `automation/production_tasks.json`. Pocetna produkciona lista namerno sadrzi samo dokumentacione zadatke koji ne menjaju aplikaciju, katalog, DMX podatke niti stabilne funkcije.

Pokretanje jednog zadatka:

```
py scripts/overnight_git_runner.py --tasks automation/production_tasks.json --max-tasks 1
```

Pokretanje cele pocetne nocne liste:

```
py scripts/overnight_git_runner.py --tasks automation/production_tasks.json
```

Kada ovaj tok jednom prodje na racunaru od pocetka do kraja, u produkcionu listu se mogu dodavati stvarni LightingAI razvojni zadaci, ali svaki mora imati precizan `allowed_paths`, odobrene testove i dovoljno repozitorijumskog konteksta da se ne izmisljaju tehnicki ili proizvodjacki podaci.
