Przygotuj aplikację, stronę html wykorzystującą JavaScript.
Strona będzie służyła do wpisywania danych z protokołu meczowego oraz generowania podsumowania, statystyk z wprowadzonych danych, dotyczących meczu dart.
Strona ma mieć tytuł protokół ligowy kujawsko-pomorskiej ligi darta.
Mecze w ramach rozgywek to 501 do (double out) - co oznacza, że wygrywa zawodnik, który pierwszy na liczniku punktów uzyska liczbę 0 (każdy rzut odejmuje punkty ze stanu początkowego licznika)
Na stronie będę prezentowane informacje z obiektu json, który będzie zawierał listę drużyn z podziałem na ligi. Do każdej drużyny będą przypisanie zawodnicy drużyny do 10 zawodników,  jeden kapitam, jedno miejsce nazwa lokalu, adres lokalu oraz sponsorzy.

Użytkownik  ma wskazywać:
# 1. Datę meczu oraz kolejkę ligową
Niech użytkwonik wskazuje datę meczu za pomocą data pickera oraz kolejkę ligową w polu tekstowym.
# 1.1.
Użytkownik musi wskazywać ligę. Po wybraniu ligi będzie mógł wskazać drużynę gospodarzy i gości z drużyn przypisanych do danej ligi.

# 2. Drużyna gospodarzy
Po wybraniu drużyny gospodarzy ma się uzupełnić pole Lokalziacja pod datą meczu wartością Nazwy lokalu oraz adresu przypisanego do wskazanej drużyny gospodarzy.
Pod drużyną gospodarzy użytkownik będzie wskazywał 4 zawodników H1- H4 oraz będzie mógł wskazać 4 rezerwowych HR1- HR4.
Zawodnicy będą wybierani z listy zawodników przypisanych do wskazanej drużyny gospodarzy. Raz przypisany zawodnik nie może występować na innej pozycji.

# 3. Drużyna gości
Pod drużyną gości użytkownik będzie wskazywał 4 zawodników G1- G4 oraz będzie mógł wskazać 4 rezerwowych GR1- GR4.
Zawodnicy będą wybierani z listy zawodników przypisanych do wskazanej drużyny gości. Raz przypisany zawodnik nie może występować na innej pozycji.

# 4. Przebieg meczu
## 4.1 Ogólne zasady
Mecz będzie podzielony na 12 pojedynków w następującej kolejności 4x 1vs1, 4x 2vs2 oraz 4x 1v1.
W meczu mogą odbyć się pojedynki o dwóch typach:
* Singiel (1vs1)- opisany w punkcie 4.1.1
* Pary liga (2vs2)- opisany w punkcie 4.2.2

W meczu możliwa jest zmiana gracza przykład gracz H1 zostaje zmieniony na gracza HR1. Oznacza to, że gracz H1 nie bedzie mógł już uczestniczyć w żadnym pojedynku, 
a gracz HR1 zastępuje w rozpisce pojedynków gracza H1. Natomiat gracz HR1 może być zmienony przez innego zawodnika rezerwowego.

### 4.1.1 Singiel - dwóch graczy gra przeciw sobie
Użytkwonik musi móc wskazać ile legów zdobył gracz gospodarzy oraz gracz gości.Zawodnicy grają maksymalnie 3 legi
Możliwe punkty to 2:0, 2:1, 0:2, 1:2)
W każdym legu należy zanotować: 
* kto wygrał leg, 
* którą lotką zawodnik wygrał leg
* ile punktów pozostało przeciwnikowi do zakończenia gry
* Leg1 rozpoczyna zawsze z licznika1 zawodnik gospodarzy, na liczniku2 jest zawodnik gości. W drugim legu jest zawsze na odwrót. 
	* wyjątek stanowi trzeci leg, dla którego konieczne jest wskazanie, który zawodnik rozpoczął trzeciego lega (ma to znaczenie dla wartości obliczanej średniej)

### 4.1.2 Pary liga - para graczy gra przeciw sobie
Użytkwonik musi móc wskazać ile legów zdobyła para graczy gospdarzy oraz para graczy gości. 
W przypadku pojedynku parowego każdy z graczy ma swój licznik
Cały pojedynek można przedstawić za pomocą 4 liczników, gdzie gracz na liczniku 1 zaczyna pojedynek
Przykład:
* pojedynek h1, h2 vs g1, g2
* Leg1:
	* Licznik1: H1 - zaczyna gracz H1 pierwszy zawodnik drużyny gospodarzy
	* Licznik2: G1 - pierwszy zawodnik drużyny gości
	* Licznik3: H2 - drugi zawodnik drużyny gospdarzy
	* Licznik4: G2 - drugi zawodnik drużyny gości
* Leg2:
	* Licznik1: G1
	* Licznik2: H1
	* Licznik3: G2
	* Licznik4: H2
* Leg3 zawodnicy grają o tzw. środek co określa, czy rozpoczyna para gospodarzy czy para gości.
Jeżeli para gospodarzy to układ jest indentyczny jak w leg1, jeżeli gości do układ jest taki jak w leg2.
Kolejność liczników ma znaczenie w przypadku obliczania średniej punktowe na rzuconą lotkę.

Cały pojedynek może być maksymalnie podzielony na trzy legi.
Możliwe punkty to 2:0, 2:1, 0:2, 1:2)
W każdym legu należy zanotować: 
 * kto wygrał leg- zawsze musi być to jeden gracz z danej pary, 
 * którą lotką wygrał leg 
 * ile punktów zostało parnerowi z ligi
 * ile punktów zostało przeciwnikowi grającemu na pozycji 1
 * ile punktów zostało przeciwnikowi grającemu na pozycji 2
 * wyjątek stanowi trzeci leg, dla którego konieczne jest wskazanie który zawodnik rozpoczął trzeciego lega

## 4.2 Przebieg 
Przebieg meczu:

1. Pierwszy pojedynek
* typ: "Singiel"
* gracze: H1 vs G1

2. Drugi pojedynek
* typ: "Singiel"
* gracze: H1 vs G1

3. Trzeci pojedynek
* typ: "Singiel"
* gracze: H3 vs G4

4. Czwarty pojedynek
* typ: "Singiel"
* gracze: H4 vs G3

5. Piąty pojedynek
* typ: "Pary - liga"
* gracze: H1,H2 vs G3,G4

6. Szósty pojedynek
* typ: "Pary - liga"
* gracze: H3,H4 vs G1,G2

7. Siódmy pojedynek
* typ: "Pary - liga"
* gracze: H1,H3 vs G4,G2

8. Ósmy pojedynek
* typ: "Pary - liga"
* gracze: H2,H4 vs G3,G1

9. Dziewiąty pojedynek
* typ: "Singiel"
* gracze: H1 vs G2

10. Dziesiąty pojedynek
* typ: "Singiel"
* gracze: H2 vs G1

11. Jedenasty pojedynek
* typ: "Singiel"
* gracze: H3 vs G3

12. Dwunasty pojedynek
* typ: "Singiel"
* gracze: H4 vs G4

### 4.2.1 Zmiany
Przed każdym pojedynkiem możliwe jest wprowadzenie zmiany w zespole. To znaczy gracz z pozycji rezerwowej może zastąpić gracza z pozycji podstawowej.
Raz zmieniony zawodnik nie może już wrócić do meczu np. Gracz HR2 zastępuje gracza H1; gracz H1 nie może już wrócić do meczu, ale gracz HR2 może zostać zmieniony.

# 5. Podsumowanie
Dla każdego z zawodników musi być możliwość określenia ilosci rzuconych tzw. maksów (maksymalne ilość punktów rzucona 3 lotkami), niech będzie to pole tekstowe gdzie gracz będzie wpisywał maksy.
Dla każdego z zawodników musi być możliwość określenia najwyższych skończeń lega (skońćzenia od 100 pkt w zwyż), niech bedzie to pole tekstowe gdzie gracz po przecinku będzie wpisywał wyniki.

# 6. generowanie wyników
Niech zostanie dodany pod danymi przycisk generuj treść protokołu.
Po wybraniu przycisku zostanie wygenerowane podsumowanie z przebiegu meczu:
* wskaszujace składy drużyn gości i gospodarzy
* wskazujące przebieg meczu
* wskazujące liczbę zdobytych i straconych legów przez zawodnika
* wskazujące szybkie zakończnia (wszystkie poniżej 18 lotki, którymi gracz wygrał leg)
* wskazujące średnie z każdego pojedynku dla każdego gracza
* wskazujące średnie z pojedynków "Singiel" i "Debel" dla każdego gracza (należy uwzględnić również możliwe zmiany).
* sposób obliczania średniej:
	* obliczamy liczbę punktów na lotkę oraz na 3 lotki
	* dla gracza wygrywającego leg będzie to 501 podzielone przez liczba lotek np. gracz wygrał lega 17 lotką obliczamy zatem 501/17 = 29,47 na lotkę czyli na 3 lotki = 88,41
	* dla gracza przegrywającego należy wykonać te same obliczenia uwzględniajac liczbę punktów, która pozostała zawodnikowi. Kluczowe jest to czy gracz przegrywajacy był na 1 czy na 2 liczniku ponieważ jeżeli był na drugim liczniki to jesgo średnia będzie większa, ponieważ gracz wygrywający rzucił więcej lotek niż przegrywający. np. gracz wygrywający kończy 17 lotką, gracz przegrywający gra na drugim liczniku więc rzucił tylko 15 lotek i pozostało mu 110 punktów  (501-110)/15 = 26,06 na 3 lotki = 78,2
	* analogicznie należy policzyć średnie dla pojedynków parowych, uwzględniając licznik na, który gra dany zawodnik.
* do generowania podsumowania należy użyć prostych tagów html <b> oraz <i> 


## 6.1 Przykład wygenerowanego przebiegu meczu
```
I Kolejka - 2025-09-22

Super Dart - Dzikie lotki 20 - 7

Super Dart:
H1: Jan Celny 6-0 / 3 (single: 2-0; deble: 4-0)
- Najszybsza lotka: 18, 18
- Najwyższe skończenia: 101
- Średnia single: 83,5
- Średnia deble: 55,6
- Średnia ogółem: 69,55
H2: Grzegorz Arktyczny 8-0 / 4 (single: 4-0; deble: 4-0)
- Średnia single: 68,21
- Średnia deble: 57,12
- Średnia ogółem: 62,67
H3: Marcin Marcinkowski 6-2 / 3 (single: 2-1; deble: 4-1)
- Najszybsza lotka: 18, 18
- Średnia single: 73,94
- Średnia deble: 55,02
- Średnia ogółem: 64,48
H4: Arkadiusz Arkowy 8-2 / 4 (single: 4-1; deble: 4-1)
- Najwyższe skończenie: 120
HR1: Przemysław Perz 0-2 / 1 (single: 0-2; deble: 0-0)
HR2: Łukasz Koński 0-2 / 1 (single: 0-2; deble: 0-0)

Dzikie lotki:
G1: Wojciech Skoncentrowany 1-6 / 3 (single: 0-2; deble: 1-4)
G2: Paweł Pawliczek 1-4 / 2 (single: 0-2; deble: 1-2)
G3: Marta Bystra 1-6 / 3 (single: 1-2; deble: 0-4)
- Najszybsza lotka: 18
G4: Damian Spokojny 1-2 / 1 (single: 1-2; deble: 0-0)
GR1: Piotr Piotrowski 0-6 / 3 (single: 0-2; deble: 0-4)
GR2: Ragał Graczkowski 2-0 / 1 (single: 2-0; deble: 0-0)
GR3: Ania Celna 0-2 / 1 (single: 0-2; deble: 0-0)
GR4: Maciej Maciszek 2-2 / 2 (single: 2-0; deble: 0-2)

Przebieg meczu szczegóły:
Jan Celny - Wojciech Skoncentrowany(2:0) ---- 2:0
- Leg1: Wygrał: Jan Celny (18 lotka) średnia 83,5 | Przegrał: Wojciech Skoncentrowany (pozostało punktów 110) średnia 78,2
- Leg2: Wygrał: Jan Celny (18 lotka) średnia 83,5 | Przegrał: Wojciech Skoncentrowany (pozostało punktów 110) średnia 65,16
Grzegorz Arktyczny- Paweł Pawliczek (2:0) ---- 4:0
- Leg1: Wygrał: Grzegorz Arktyczny (20 lotka) średnia 75,15 | Przegrał: Paweł Pawliczek (pozostało punktów 170) średnia 55,16
- Leg2: Wygrał: Grzegorz Arktyczny (21 lotka) średnia 71,57 | Przegrał: Paweł Pawliczek (pozostało punktów 156) średnia 49,28
Marcin Marcinkowski - Damian Spokojny (2:1) ---- 6:1
- Leg1: Wygrał: Marcin Marcinkowski (25 lotka) średnia 60,12 | Przegrał: Damian Spokojny (pozostało punktów 114) średnia 48,38
- Leg2: Wygrał: Damian Spokojny (18 lotka) średnia 83,5 | Przegrał Marcin Marcinkowski (pozostało punktów 110) średnia 78,2
- Leg3: Zaczął: Marcin Marcinkowski Wygrał: Marcin Marcinkowski (18 lotka) średnia 83,5 | Przegrał: Damian Spokojny (pozostało punktów 156) średnia 69,00
Arkadiusz Arkowy - Marta Bystra (2:1) ---- 8:2
- Leg1: Wygrał: Arkadiusz Arkowy (25 lotka) średnia 60,12 | Przegrał: Marta Bystra (pozostało punktów 114) średnia 48,38
- Leg2: Wygrał: Marta Bystra (18 lotka) średnia 83,5 | Przegrał Arkadiusz Arkowy (pozostało punktów 110) średnia 78,2
- Leg3: Zaczął: Arkadiusz Arkowy Wygrał: Arkadiusz Arkkowy (18 lotka) średnia 83,5 | Przegrał: Marta Bystra (pozostało punktów 156) średnia 69,00

Jan Celny, Grzegorz Arktyczny- Marta Bystra, Piotr Piotrowski (2:0) ---- 10:2
- Leg1:	Wygrali: Jan Celny (27 lotka) średnia 55,6 | Grzegorcz arktyczny (pozostało punktów 32) średnia: 58,63
	Przegrali Marta Bystra (pozostało punktów 140) średnia 45,13  | Piotr Piotrowski (pozostało punktów 193) średnia: 38,5
- Leg2:	Wygrali: Jan Celny (27 lotka) średnia 55,6 | Grzegorcz arktyczny (pozostało punktów 32) średnia: 58,63
	Pregrali: Marta Bystra (pozostało punktów 140) średnia 40,11  | Piotr Piotrowski (pozostało punktów 193) średnia: 38,5
Marcin Marcinkowski, Arkadiusz Arkowy - Wojciech Skoncentrowan, Paweł Pawliczek (2:1) ---- 12:3
- Leg1: Wygrali: Arkadiusz Arkowy (26 lotka) średnia 57,80 | Marcin Marcinkowski (pozostało punktów 46) średnia 50,55
	Przegrali: Wojciech Skoncentrowany (pozostało punktów 73) średnia 47,55 | Paweł Pawliczek (pozostało punktów 20) średnia 60,13
- Leg2: Wygrali: Paweł Pawliczek (24 lotka) średnia 62,63 | Wojciec skoncentrowany (pozostało punktów 57) 55,5
	Przegrali: Marcin Marcinkowski (pozostało punktów 83) średnia 52,25 | Arkadiusz arkowy (pozostało punktów 83) średnia 59,71
- Leg3: Rozpoczął Marcin Marcinkowski
	Wygrali: Arkadiusz Arkowy (26 lotka) średnia 57,80 | Marcin Marcinkowski (pozostało punktów 46) średnia 50,55
	Przegrali: Wojciech Skoncentrowany (pozostało punktów 73) średnia 47,55 | Paweł Pawliczek (pozostało punktów 20) średnia 60,13
Jan Celny, Marcin Marcinkowski - Piotr Piotrowski, Maciej Maciszek (2:0) ---- 14:3
- Leg1:	Wygrali: Jan Celny (27 lotka) średnia 55,6 | Marcin Marcinkowski (pozostało punktów 32) średnia: 58,63
	Przegrali Piotr Piotrowski (pozostało punktów 140) średnia 45,13  | Maciej Maciszek (pozostało punktów 193) średnia: 38,5
- Leg2:	Wygrali: Jan Celny (27 lotka) średnia 55,6 | Marcin Marcinkowski (pozostało punktów 32) średnia: 58,63
	Pregrali: Piotr Piotrowski (pozostało punktów 140) średnia 40,11  | Maciej Maciszek (pozostało punktów 193) średnia: 38,5
Grzegorz Arktyczny, Arkadiusz Arkowy - Marta Bystra, Wojciech Skoncentrowany(2:0) ---- 16:3
- Leg1:	Wygrali: Grzegorz Arktyczny (27 lotka) średnia 55,6 | Arkadiusz Arkowy(pozostało punktów 32) średnia: 58,63
	Przegrali Marta Bystra (pozostało punktów 140) średnia 45,13  | Wojciech Skoncentrowany (pozostało punktów 193) średnia: 38,5
- Leg2:	Wygrali: Grzegorz Arktyczny (27 lotka) średnia 55,6 | Arkadiusz Arkowy (pozostało punktów 32) średnia: 58,63
	Pregrali: Marta Bystra(pozostało punktów 140) średnia 40,11  | Wojciech Skoncentrowany (pozostało punktów 193) średnia: 38,5

Przemysław Perz - Maciej Maciszek (0:2) ---- 16:5
- Leg1: Wygrał: Maciej Maciszek (25 lotka) średnia 60,12 | Przegrał: Przemysław Perz (pozostało punktów 93) średnia 45,33
- Leg2: Wygrał: Maciej Maciszek (27 lotka) średnia 55,66 | Przegrał: Przemysław Perz (pozostało punktów 64) średnia 54,63
Grzegorz Arktyczny- Ania Celna (2:0) ---- 18:5
- Leg1: Wygrał: Grzegorz Arktyczny (22 lotka) średnia 68,32 | Przegrał: Agnia Celna (pozostało punktów 138) średnia 51,86
- Leg2: Wygrał: Grzegorz Arktyczny (26 lotka) średnia 57,80 | Przegrał: Agnia Celna (pozostało punktów 84) średnia 46,33
Łukasz Koński - Ragał Graczkowski (0:2) ---- 18:7
- Leg1: Wygrał: Łukasz Koński (25 lotka) średnia 60,12 | Przegrał: Ragał Graczkowski (pozostało punktów 93) średnia 45,33
- Leg2: Wygrał: Łukasz Koński (27 lotka) średnia 55,66 | Przegrał: Ragał Graczkowski (pozostało punktów 64) średnia 54,63
Arkadiusz Arkowy - Piotr Piotrowski (2:0) ---- 20:7
- Leg1: Wygrał: Arkadiusz Arkowy (22 lotka) średnia 68,32 | Przegrał: Piotr Piotrowski (pozostało punktów 138) średnia 51,86
- Leg2: Wygrał: Arkadiusz Arkowy (26 lotka) średnia 57,80 | Przegrał: Piotr Piotrowski(pozostało punktów 84) średnia 46,33

Dzięki za mecz!
```
