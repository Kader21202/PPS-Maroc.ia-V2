PPS-Maroc.ia-V2

PPS-Maroc.ia-V2 est une plateforme expérimentale d'intelligence artificielle consacrée au traitement structuré des connaissances, au raisonnement documentaire et à l'orchestration de modèles de langage.

Le projet vise à séparer le traitement cognitif et documentaire de la génération linguistique finale, afin de rendre le fonctionnement du système plus structuré, testable et traçable.

Objectif

PPS-Maroc.ia-V2 explore une architecture dans laquelle un modèle de langage n'est pas seul responsable de la construction de la réponse.

Le système organise un pipeline comprenant notamment :

\- La recherche documentaire;

\- L’analyse de la requête;

\- L’organisation des connaissances;

\- La sélection des informations importantes;

\- La formulation de réponse cognitive intermédiaire;

\- Les contrôles d'exécutions;

\- Et en cas de necessite ,l’utilisation d’un modèle de langage pour expression finale;

Cette séparation permet d'étudier indépendamment les mécanismes de traitement des connaissances et la génération linguistique.

Architecture générale

Le projet est organisé autour de plusieurs composants spécialisés.

Traitement documentaire

Le pipeline documentaire assure notamment :

\- Recherche dans une base de connaissances;

\- Sélection des documents et fragments pertinents;

\- Traitements d’une quantité importante de documents;

\- Conservation de la provenance des informations;

\- Gestion contrôlée du volume documentaire;





Traitement cognitif

Les informations sélectionnées sont transformées et organisées avant la génération de la réponse finale.

Cette étape permet de distinguer :

connaissance disponible - sélection - traitement - réponse cognitive - expression linguistique

plutôt que de confier l'ensemble du processus directement à un modèle génératif.

Fournisseurs IA

L'architecture dispose d'une abstraction permettant de séparer le fonctionnement interne de PPS du fournisseur de modèle de langage.

Le fournisseur actuellement branché par défaut dans l'application est Mistral.

D'autres adaptateurs peuvent être conservés dans l'architecture à des fins de développement, de test ou de comparaison sans constituer le fournisseur actif de l'application.

Contrôle d'exécution

PPS-Maroc.ia-V2 comporte également des mécanismes destinés à contrôler :

\- Administration des requêtes;

\- Limites imposées par certains fournisseurs;

\-Traitement de volumes documentaires qui dépasse une requête unique;

\- Et en cas de nécessité, l'exécution en plusieures étapes;

Tests

Le projet comprend une suite de tests couvrant notamment :

Les fournisseurs IA , leurs capacités déclarées et la gestion des erreurs, 

Le pipeline documentaire ;

La sélection des connaissances;

Letraitement multi-document;

Les mécanismes d'exécution;

Les interfaces entre composants;





Les tests font partie intégrante de la démarche expérimentale : les résultats négatifs et les comportements non conformes sont conservés afin de guider les corrections et l'évolution de l'architecture.

Organisation du dépôt

data/pps\_knowledge/   Base documentaire et connaissances

src/       Code source principal

tests/      Tests automatisés

package.json  Configuration du projet

Principes de conception

Le développement de PPS-Maroc.ia-V2 repose notamment sur les principes suivants :

\- séparation entre traitement des connaissances et génération linguistique ;

\- modularité des composants ;

\- indépendance vis-à-vis d'un fournisseur unique de modèle de langage ;

\- traçabilité des informations utilisées ;

\- validation par tests ;

\- conservation des résultats négatifs ;

\- évolution progressive de l'architecture à partir des résultats expérimentaux.

Statut

PPS-Maroc.ia-V2 est un projet expérimental de recherche et développement en intelligence artificielle.

Il est utilisé pour étudier et tester différentes approches de traitement documentaire, d'organisation des connaissances, de contrôle d'exécution et d'intégration de modèles de langage.

Auteur

Abdelkader Azzouzi

Ingénieur Chercheur indépendant en intelligence artificielle - Maroc





