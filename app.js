const DB_NAME = "QuelquePartDansCetteMaison";
const DB_VERSION = 1;
const STORE_OBJETS = "objets";

let db;
let objets = [];
let photoActuelle = "";
let vueActuelle = "tous";

let familles =
  JSON.parse(
    localStorage.getItem("famillesMaison")
  ) || [
    "Alimentation",
    "Bricolage",
    "Entretien",
    "Maison",
    "Papeterie"
  ];


// ==========================================================
// BASE DE DONNÉES
// ==========================================================

function ouvrirBaseDeDonnees() {

  return new Promise((resolve, reject) => {

    const requete =
      indexedDB.open(
        DB_NAME,
        DB_VERSION
      );


    requete.onupgradeneeded =
      event => {

        const base =
          event.target.result;

        if (
          !base.objectStoreNames.contains(
            STORE_OBJETS
          )
        ) {

          base.createObjectStore(
            STORE_OBJETS,
            {
              keyPath: "id"
            }
          );
        }
      };


    requete.onsuccess =
      event => {

        db =
          event.target.result;

        resolve(db);
      };


    requete.onerror =
      () => {

        reject(
          requete.error
        );
      };
  });
}


function recupererTousLesObjetsDB() {

  return new Promise((resolve, reject) => {

    const transaction =
      db.transaction(
        STORE_OBJETS,
        "readonly"
      );

    const magasin =
      transaction.objectStore(
        STORE_OBJETS
      );

    const requete =
      magasin.getAll();


    requete.onsuccess =
      () => {

        resolve(
          requete.result || []
        );
      };


    requete.onerror =
      () => {

        reject(
          requete.error
        );
      };
  });
}


function enregistrerObjetDB(objet) {

  return new Promise((resolve, reject) => {

    const transaction =
      db.transaction(
        STORE_OBJETS,
        "readwrite"
      );

    transaction
      .objectStore(
        STORE_OBJETS
      )
      .put(objet);


    transaction.oncomplete =
      () => resolve();


    transaction.onerror =
      () =>
        reject(
          transaction.error
        );
  });
}


function supprimerObjetDB(id) {

  return new Promise((resolve, reject) => {

    const transaction =
      db.transaction(
        STORE_OBJETS,
        "readwrite"
      );


    transaction
      .objectStore(
        STORE_OBJETS
      )
      .delete(id);


    transaction.oncomplete =
      () => resolve();


    transaction.onerror =
      () =>
        reject(
          transaction.error
        );
  });
}


function viderBaseObjets() {

  return new Promise((resolve, reject) => {

    const transaction =
      db.transaction(
        STORE_OBJETS,
        "readwrite"
      );


    transaction
      .objectStore(
        STORE_OBJETS
      )
      .clear();


    transaction.oncomplete =
      () => resolve();


    transaction.onerror =
      () =>
        reject(
          transaction.error
        );
  });
}


// ==========================================================
// ÉLÉMENTS HTML
// ==========================================================

const boutonAjouter =
  document.getElementById("boutonAjouter");

const boutonFlottant =
  document.getElementById("boutonFlottant");

const formulaire =
  document.getElementById("formulaire");

const overlay =
  document.getElementById("overlay");

const fermerFormulaire =
  document.getElementById("fermerFormulaire");

const annuler =
  document.getElementById("annuler");

const objetId =
  document.getElementById("objetId");

const nomInput =
  document.getElementById("nom");

const quantiteInput =
  document.getElementById("quantite");

const familleSelect =
  document.getElementById("famille");

const emplacementInput =
  document.getElementById("emplacement");

const favoriInput =
  document.getElementById("favori");

const photoInput =
  document.getElementById("photo");

const choisirPhoto =
  document.getElementById("choisirPhoto");

const apercuPhoto =
  document.getElementById("apercuPhoto");

const moinsQuantite =
  document.getElementById("moinsQuantite");

const plusQuantite =
  document.getElementById("plusQuantite");

const nouvelleFamille =
  document.getElementById("nouvelleFamille");

const listeEmplacements =
  document.getElementById("listeEmplacements");

const enregistrer =
  document.getElementById("enregistrer");

const supprimerDepuisFormulaire =
  document.getElementById(
    "supprimerDepuisFormulaire"
  );

const rechercheInput =
  document.getElementById("recherche");

const effacerRecherche =
  document.getElementById("effacerRecherche");

const filtreFamille =
  document.getElementById("filtreFamille");

const listeObjets =
  document.getElementById("listeObjets");

const resultatTexte =
  document.getElementById("resultatTexte");

const nombreObjets =
  document.getElementById("nombreObjets");

const statReferences =
  document.getElementById("statReferences");

const statFamilles =
  document.getElementById("statFamilles");

const statEmplacements =
  document.getElementById("statEmplacements");

const statFavoris =
  document.getElementById("statFavoris");

const toast =
  document.getElementById("toast");

const raccourcis =
  document.querySelectorAll(".raccourci");

const exporterInventaire =
  document.getElementById(
    "exporterInventaire"
  );

const importerInventaire =
  document.getElementById(
    "importerInventaire"
  );

const fichierImport =
  document.getElementById(
    "fichierImport"
  );


// ==========================================================
// FAMILLES
// ==========================================================

function sauvegarderFamilles() {

  localStorage.setItem(
    "famillesMaison",
    JSON.stringify(familles)
  );
}


function mettreAJourFamilles() {

  const valeurFormulaire =
    familleSelect.value;

  const valeurFiltre =
    filtreFamille.value;


  familleSelect.innerHTML = `
    <option value="">
      Choisir une famille
    </option>
  `;


  filtreFamille.innerHTML = `
    <option value="">
      Toutes les familles
    </option>
  `;


  [...familles]
    .sort((a, b) =>
      a.localeCompare(
        b,
        "fr",
        {
          sensitivity: "base"
        }
      )
    )
    .forEach(famille => {

      const option1 =
        document.createElement(
          "option"
        );

      option1.value =
        famille;

      option1.textContent =
        famille;

      familleSelect.appendChild(
        option1
      );


      const option2 =
        document.createElement(
          "option"
        );

      option2.value =
        famille;

      option2.textContent =
        famille;

      filtreFamille.appendChild(
        option2
      );
    });


  familleSelect.value =
    valeurFormulaire;

  filtreFamille.value =
    valeurFiltre;
}


nouvelleFamille.addEventListener(
  "click",
  () => {

    const proposition =
      prompt(
        "Comment veux-tu appeler cette famille ?"
      );


    if (!proposition) return;


    const nom =
      proposition.trim();


    if (!nom) return;


    const existante =
      familles.find(
        famille =>
          famille.toLowerCase() ===
          nom.toLowerCase()
      );


    if (!existante) {

      familles.push(nom);

      sauvegarderFamilles();

      mettreAJourFamilles();

      familleSelect.value =
        nom;

    } else {

      familleSelect.value =
        existante;
    }


    afficherToast(
      "Famille ajoutée."
    );
  }
);


// ==========================================================
// MODAL
// ==========================================================

function ouvrirModal() {

  overlay.classList.remove(
    "cache"
  );

  formulaire.classList.remove(
    "cache"
  );

  document.body.style.overflow =
    "hidden";
}


function fermerModal() {

  overlay.classList.add(
    "cache"
  );

  formulaire.classList.add(
    "cache"
  );

  document.body.style.overflow =
    "";
}


function ouvrirAjout() {

  viderFormulaire();


  document
    .getElementById(
      "titreFormulaire"
    )
    .textContent =
      "Ajouter un objet";


  enregistrer.textContent =
    "Enregistrer";


  supprimerDepuisFormulaire
    .classList
    .add("cache");


  ouvrirModal();


  setTimeout(
    () => nomInput.focus(),
    100
  );
}


boutonAjouter.addEventListener(
  "click",
  ouvrirAjout
);


boutonFlottant.addEventListener(
  "click",
  ouvrirAjout
);


fermerFormulaire.addEventListener(
  "click",
  fermerModal
);


annuler.addEventListener(
  "click",
  fermerModal
);


overlay.addEventListener(
  "click",
  fermerModal
);


// ==========================================================
// PHOTO
// ==========================================================

choisirPhoto.addEventListener(
  "click",
  () => {

    photoInput.click();
  }
);


photoInput.addEventListener(
  "change",
  () => {

    const fichier =
      photoInput.files[0];


    if (!fichier) return;


    if (
      !fichier.type.startsWith(
        "image/"
      )
    ) {

      afficherToast(
        "Choisis une image."
      );

      return;
    }


    const lecteur =
      new FileReader();


    lecteur.onload =
      event => {

        photoActuelle =
          event.target.result;


        apercuPhoto.innerHTML = `
          <img
            src="${photoActuelle}"
            alt="Aperçu de l'objet"
          >
        `;
      };


    lecteur.readAsDataURL(
      fichier
    );
  }
);


// ==========================================================
// QUANTITÉ
// ==========================================================

moinsQuantite.addEventListener(
  "click",
  () => {

    const valeur =
      Number(
        quantiteInput.value
      ) || 1;


    if (valeur > 1) {

      quantiteInput.value =
        valeur - 1;
    }
  }
);


plusQuantite.addEventListener(
  "click",
  () => {

    const valeur =
      Number(
        quantiteInput.value
      ) || 1;


    quantiteInput.value =
      valeur + 1;
  }
);


// ==========================================================
// EMPLACEMENTS
// ==========================================================

function mettreAJourEmplacements() {

  const emplacements =
    [
      ...new Set(
        objets
          .map(
            objet =>
              objet.emplacement
          )
          .filter(Boolean)
      )
    ];


  emplacements.sort(
    (a, b) =>
      a.localeCompare(
        b,
        "fr",
        {
          sensitivity: "base"
        }
      )
  );


  listeEmplacements.innerHTML =
    "";


  emplacements.forEach(
    emplacement => {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        emplacement;


      listeEmplacements.appendChild(
        option
      );
    }
  );
}


// ==========================================================
// ENREGISTRER
// ==========================================================

enregistrer.addEventListener(
  "click",
  async () => {

    const nom =
      nomInput.value.trim();


    const emplacement =
      emplacementInput.value.trim();


    const quantite =
      Math.max(
        1,
        Number(
          quantiteInput.value
        ) || 1
      );


    const famille =
      familleSelect.value ||
      "Sans famille";


    if (!nom) {

      afficherToast(
        "Donne un nom à l'objet."
      );

      nomInput.focus();

      return;
    }


    if (!emplacement) {

      afficherToast(
        "Indique où l'objet est rangé."
      );

      emplacementInput.focus();

      return;
    }


    const id =
      Number(
        objetId.value
      );


    if (id) {

      const index =
        objets.findIndex(
          objet =>
            objet.id === id
        );


      if (index !== -1) {

        const objetModifie =
          {
            ...objets[index],

            nom,
            quantite,
            famille,
            emplacement,

            photo:
              photoActuelle,

            favori:
              favoriInput.checked,

            dateModification:
              new Date()
                .toISOString()
          };


        await enregistrerObjetDB(
          objetModifie
        );


        objets[index] =
          objetModifie;
      }


      afficherToast(
        "Objet modifié."
      );

    } else {

      const nouvelObjet =
        {
          id:
            Date.now(),

          nom,
          quantite,
          famille,
          emplacement,

          photo:
            photoActuelle,

          favori:
            favoriInput.checked,

          dateAjout:
            new Date()
              .toISOString(),

          dateModification:
            new Date()
              .toISOString()
        };


      await enregistrerObjetDB(
        nouvelObjet
      );


      objets.unshift(
        nouvelObjet
      );


      afficherToast(
        "Objet ajouté."
      );
    }


    if (
      famille !==
        "Sans famille" &&
      !familles.includes(
        famille
      )
    ) {

      familles.push(
        famille
      );

      sauvegarderFamilles();
    }


    mettreAJourFamilles();

    mettreAJourEmplacements();

    fermerModal();

    afficherObjets();
  }
);


// ==========================================================
// MODIFIER
// ==========================================================

function modifierObjet(id) {

  const objet =
    objets.find(
      element =>
        element.id === id
    );


  if (!objet) return;


  objetId.value =
    objet.id;

  nomInput.value =
    objet.nom;

  quantiteInput.value =
    objet.quantite || 1;

  familleSelect.value =
    objet.famille || "";

  emplacementInput.value =
    objet.emplacement || "";

  favoriInput.checked =
    Boolean(
      objet.favori
    );


  photoActuelle =
    objet.photo || "";


  if (photoActuelle) {

    apercuPhoto.innerHTML = `
      <img
        src="${photoActuelle}"
        alt="Photo de l'objet"
      >
    `;

  } else {

    apercuPhoto.innerHTML =
      "";
  }


  document
    .getElementById(
      "titreFormulaire"
    )
    .textContent =
      "Modifier l'objet";


  enregistrer.textContent =
    "Enregistrer les modifications";


  supprimerDepuisFormulaire
    .classList
    .remove("cache");


  ouvrirModal();
}


function viderFormulaire() {

  objetId.value =
    "";

  nomInput.value =
    "";

  quantiteInput.value =
    1;

  familleSelect.value =
    "";

  emplacementInput.value =
    "";

  favoriInput.checked =
    false;

  photoInput.value =
    "";

  photoActuelle =
    "";

  apercuPhoto.innerHTML =
    "";
}


// ==========================================================
// SUPPRESSION
// ==========================================================

supprimerDepuisFormulaire
  .addEventListener(
    "click",
    async () => {

      const id =
        Number(
          objetId.value
        );


      if (id) {

        await supprimerObjet(
          id
        );
      }
    }
  );


async function supprimerObjet(id) {

  const objet =
    objets.find(
      element =>
        element.id === id
    );


  if (!objet) return;


  const confirmation =
    confirm(
      `Supprimer définitivement "${objet.nom}" ?`
    );


  if (!confirmation) return;


  await supprimerObjetDB(
    id
  );


  objets =
    objets.filter(
      element =>
        element.id !== id
    );


  mettreAJourEmplacements();

  afficherObjets();

  fermerModal();


  afficherToast(
    "Objet supprimé."
  );
}


// ==========================================================
// QUANTITÉS RAPIDES
// ==========================================================

async function changerQuantite(
  id,
  changement
) {

  const objet =
    objets.find(
      element =>
        element.id === id
    );


  if (!objet) return;


  const nouvelleQuantite =
    Number(
      objet.quantite
    ) +
    changement;


  if (
    nouvelleQuantite <= 0
  ) {

    const confirmation =
      confirm(
        `"${objet.nom}" arrive à 0.\n\nLe retirer de l'inventaire ?`
      );


    if (!confirmation) return;


    await supprimerObjetDB(
      id
    );


    objets =
      objets.filter(
        element =>
          element.id !== id
      );


  } else {

    objet.quantite =
      nouvelleQuantite;


    objet.dateModification =
      new Date()
        .toISOString();


    await enregistrerObjetDB(
      objet
    );
  }


  mettreAJourEmplacements();

  afficherObjets();
}


// ==========================================================
// FAVORIS
// ==========================================================

async function basculerFavori(id) {

  const objet =
    objets.find(
      element =>
        element.id === id
    );


  if (!objet) return;


  objet.favori =
    !objet.favori;


  objet.dateModification =
    new Date()
      .toISOString();


  await enregistrerObjetDB(
    objet
  );


  afficherObjets();
}


// ==========================================================
// RECHERCHE
// ==========================================================

rechercheInput.addEventListener(
  "input",
  () => {

    effacerRecherche
      .classList
      .toggle(
        "cache",
        rechercheInput
          .value
          .length === 0
      );


    afficherObjets();
  }
);


effacerRecherche.addEventListener(
  "click",
  () => {

    rechercheInput.value =
      "";


    effacerRecherche
      .classList
      .add("cache");


    rechercheInput.focus();


    afficherObjets();
  }
);


filtreFamille.addEventListener(
  "change",
  afficherObjets
);


// ==========================================================
// VUES
// ==========================================================

raccourcis.forEach(
  bouton => {

    bouton.addEventListener(
      "click",
      () => {

        raccourcis.forEach(
          element =>
            element
              .classList
              .remove(
                "actif"
              )
        );


        bouton
          .classList
          .add("actif");


        vueActuelle =
          bouton.dataset.vue;


        afficherObjets();
      }
    );
  }
);


// ==========================================================
// AFFICHAGE
// ==========================================================

function afficherObjets() {

  const recherche =
    normaliserTexte(
      rechercheInput.value
    );


  const familleFiltre =
    filtreFamille.value;


  let resultats =
    objets.filter(
      objet => {

        const contenu =
          normaliserTexte(
            [
              objet.nom,
              objet.famille,
              objet.emplacement
            ].join(" ")
          );


        const rechercheOK =
          contenu.includes(
            recherche
          );


        const familleOK =
          !familleFiltre ||
          objet.famille ===
            familleFiltre;


        let vueOK =
          true;


        if (
          vueActuelle ===
          "favoris"
        ) {

          vueOK =
            Boolean(
              objet.favori
            );
        }


        if (
          vueActuelle ===
          "recents"
        ) {

          const dateObjet =
            new Date(
              objet.dateAjout
            ).getTime();


          const septJours =
            7 *
            24 *
            60 *
            60 *
            1000;


          vueOK =
            Date.now() -
            dateObjet <=
            septJours;
        }


        return (
          rechercheOK &&
          familleOK &&
          vueOK
        );
      }
    );


  resultats.sort(
    (a, b) => {

      const dateA =
        new Date(
          a.dateModification ||
          a.dateAjout ||
          0
        ).getTime();


      const dateB =
        new Date(
          b.dateModification ||
          b.dateAjout ||
          0
        ).getTime();


      return (
        dateB -
        dateA
      );
    }
  );


  listeObjets.innerHTML =
    "";


  if (
    resultats.length === 0
  ) {

    const vide =
      objets.length === 0;


    listeObjets.innerHTML = `
      <div class="vide">

        <div class="icone-vide">
          ⌂
        </div>

        <h3>
          ${
            vide
              ? "La maison est encore vide"
              : "Rien par ici"
          }
        </h3>

        <p>
          ${
            vide
              ? "Ajoute ton premier objet pour commencer ton inventaire."
              : "Essaie une autre recherche, une autre famille ou une autre vue."
          }
        </p>

      </div>
    `;

  } else {

    resultats.forEach(
      objet => {

        const carte =
          document.createElement(
            "article"
          );


        carte.className =
          "objet";


        const image =
          objet.photo
            ? `
              <img
                class="photo-objet"
                src="${objet.photo}"
                alt=""
              >
            `
            : `
              <div
                class="image-placeholder"
                aria-hidden="true"
              >
                ⌂
              </div>
            `;


        carte.innerHTML = `

          ${image}

          <div class="infos-objet">

            <div class="ligne-badges">

              <span class="badge">
                ${echapperHTML(
                  objet.famille
                )}
              </span>

              ${
                objet.favori
                  ? `
                    <span class="etoile">
                      ♥
                    </span>
                  `
                  : ""
              }

            </div>


            <h3>
              ${echapperHTML(
                objet.nom
              )}
            </h3>


            <p class="emplacement-objet">
              📍
              ${echapperHTML(
                objet.emplacement
              )}
            </p>


            <div class="bas-carte">

              <div class="quantite-rapide">

                <button
                  type="button"
                  onclick="changerQuantite(${objet.id}, -1)"
                >
                  −
                </button>

                <strong>
                  ${objet.quantite}
                </strong>

                <button
                  type="button"
                  onclick="changerQuantite(${objet.id}, 1)"
                >
                  +
                </button>

              </div>


              <button
                type="button"
                class="modifier"
                onclick="modifierObjet(${objet.id})"
              >
                Modifier
              </button>

            </div>

          </div>


          <button
            type="button"
            class="favori-carte ${
              objet.favori
                ? "actif"
                : ""
            }"
            onclick="basculerFavori(${objet.id})"
          >
            ${
              objet.favori
                ? "♥"
                : "♡"
            }
          </button>
        `;


        listeObjets.appendChild(
          carte
        );
      }
    );
  }


  if (
    rechercheInput.value.trim()
  ) {

    resultatTexte.textContent =
      `${resultats.length} résultat${
        resultats.length > 1
          ? "s"
          : ""
      }`;

  } else if (
    vueActuelle ===
    "favoris"
  ) {

    resultatTexte.textContent =
      "Mes objets favoris";

  } else if (
    vueActuelle ===
    "recents"
  ) {

    resultatTexte.textContent =
      "Ajoutés ces 7 derniers jours";

  } else {

    resultatTexte.textContent =
      "Tous les objets";
  }


  mettreAJourStatistiques();
}


// ==========================================================
// STATISTIQUES
// ==========================================================

function mettreAJourStatistiques() {

  const quantiteTotale =
    objets.reduce(
      (
        total,
        objet
      ) =>
        total +
        Number(
          objet.quantite || 0
        ),
      0
    );


  const famillesUtilisees =
    new Set(
      objets.map(
        objet =>
          objet.famille
      )
    );


  const emplacements =
    new Set(
      objets
        .map(
          objet =>
            objet.emplacement
        )
        .filter(Boolean)
    );


  const favoris =
    objets.filter(
      objet =>
        objet.favori
    );


  nombreObjets.textContent =
    quantiteTotale;


  statReferences.textContent =
    objets.length;


  statFamilles.textContent =
    famillesUtilisees.size;


  statEmplacements.textContent =
    emplacements.size;


  statFavoris.textContent =
    favoris.length;
}


// ==========================================================
// EXPORTER
// ==========================================================

exporterInventaire.addEventListener(
  "click",
  () => {

    const sauvegarde = {

      application:
        "Quelque part dans cette maison",

      version:
        1,

      dateExport:
        new Date()
          .toISOString(),

      familles,

      objets
    };


    const contenu =
      JSON.stringify(
        sauvegarde,
        null,
        2
      );


    const fichier =
      new Blob(
        [contenu],
        {
          type:
            "application/json"
        }
      );


    const url =
      URL.createObjectURL(
        fichier
      );


    const lien =
      document.createElement(
        "a"
      );


    const date =
      new Date()
        .toISOString()
        .slice(0, 10);


    lien.href =
      url;


    lien.download =
      `inventaire-maison-${date}.json`;


    document.body.appendChild(
      lien
    );


    lien.click();


    lien.remove();


    URL.revokeObjectURL(
      url
    );


    afficherToast(
      "Sauvegarde créée."
    );
  }
);


// ==========================================================
// IMPORTER / RESTAURER
// ==========================================================

importerInventaire.addEventListener(
  "click",
  () => {

    fichierImport.click();
  }
);


fichierImport.addEventListener(
  "change",
  async () => {

    const fichier =
      fichierImport.files[0];


    if (!fichier) {
      return;
    }


    try {

      const texte =
        await fichier.text();


      const sauvegarde =
        JSON.parse(
          texte
        );


      if (
        !sauvegarde ||
        !Array.isArray(
          sauvegarde.objets
        )
      ) {

        throw new Error(
          "Format incorrect"
        );
      }


      const confirmation =
        confirm(
          `Cette sauvegarde contient ${sauvegarde.objets.length} référence(s).\n\nRestaurer cette sauvegarde remplacera l'inventaire actuel.\n\nContinuer ?`
        );


      if (!confirmation) {

        fichierImport.value =
          "";

        return;
      }


      await viderBaseObjets();


      objets =
        sauvegarde.objets;


      for (
        const objet
        of objets
      ) {

        await enregistrerObjetDB(
          objet
        );
      }


      if (
        Array.isArray(
          sauvegarde.familles
        )
      ) {

        familles =
          sauvegarde.familles;

      } else {

        familles =
          [
            ...new Set(
              objets
                .map(
                  objet =>
                    objet.famille
                )
                .filter(Boolean)
            )
          ];
      }


      sauvegarderFamilles();


      mettreAJourFamilles();

      mettreAJourEmplacements();

      afficherObjets();


      afficherToast(
        "Inventaire restauré."
      );


    } catch (erreur) {

      console.error(
        erreur
      );


      alert(
        "Ce fichier ne semble pas être une sauvegarde valide de l'application."
      );
    }


    fichierImport.value =
      "";
  }
);


// ==========================================================
// UTILITAIRES
// ==========================================================

let minuterieToast;


function afficherToast(
  message
) {

  clearTimeout(
    minuterieToast
  );


  toast.textContent =
    message;


  toast.classList.remove(
    "cache"
  );


  minuterieToast =
    setTimeout(
      () => {

        toast.classList.add(
          "cache"
        );

      },
      2200
    );
}


function normaliserTexte(
  texte = ""
) {

  return String(
    texte
  )
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .trim();
}


function echapperHTML(
  texte = ""
) {

  const div =
    document.createElement(
      "div"
    );


  div.textContent =
    texte;


  return div.innerHTML;
}


document.addEventListener(
  "keydown",
  event => {

    if (
      event.key ===
      "Escape"
    ) {

      fermerModal();
    }
  }
);


// ==========================================================
// DÉMARRAGE
// ==========================================================

async function demarrerApplication() {

  try {

    await ouvrirBaseDeDonnees();


    objets =
      await recupererTousLesObjetsDB();


    mettreAJourFamilles();

    mettreAJourEmplacements();

    afficherObjets();


    if (
      navigator.storage &&
      navigator.storage.persist
    ) {

      navigator.storage
        .persist()
        .catch(
          () => {}
        );
    }


  } catch (erreur) {

    console.error(
      erreur
    );


    afficherToast(
      "Impossible d'ouvrir la base de données."
    );
  }
}


demarrerApplication();