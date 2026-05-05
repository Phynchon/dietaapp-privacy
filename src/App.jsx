import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";
import "./App.css";
import menus1600 from "./data/menus1600.json";
import { consejos } from "./data/consejos";
import MealCardsGrid from "./components/MealCardsGrid";
import ImcModal from "./components/ImcModal";
import FoodBurstScene from "./components/FoodBurstScene";
import { getUiText } from "./constants/uiText";
import { submitConsultToBackend } from "./services/consultService";
import {
  fetchUserPlanFromBackend,
  syncDailyCheckinToBackend,
  syncProgramStartToBackend,
  syncUserPlanToBackend,
  syncUserProfileToBackend,
} from "./services/trackingSyncService";
import { trackAnalyticsEvent } from "./services/analyticsService";
import {
  createProgramStartRecord,
  getLatestDailyTracking,
  getLatestProgramSnapshot,
  getPendingMorningCheckin,
  saveMorningCheckin,
} from "./services/programTrackingService";
import {
  initializePushNotifications,
  requestPushPermission,
} from "./services/pushNotifications";
import logoDieta from "../LogoDieta.png";
import rotulo from "../Rotulo.png";
import flechaDe from "../Flechade.png";
import flechaEn from "../Flechaen.png";
import flechaEs from "../Flechaes.png";
import flechaFr from "../Flechafr.png";

const INSTALL_DATE_KEY = "dieta.installDate";
const LANGUAGE_KEY = "dieta.language";
const NOTICES_ENABLED_KEY = "dieta.noticesEnabled";
const NOTICES_DISMISSED_KEY = "dieta.dismissedNotices";
const NOTICE_PREFERENCES_KEY = "dieta.noticePreferences";
const CONSULT_HISTORY_KEY = "dieta.consultHistory";
const PROGRAM_START_DATE_KEY = "dieta.programStartDate";
const TRIAL_POPUP_LAST_SEEN_DAY_KEY = "dieta.trialPopupLastSeenDayByProgram";
const STATS_DATA_AUTH_KEY = "dieta.statsDataAuthorized";
const STATS_PROFILE_KEY = "dieta.statsProfile";
const USER_PLAN_KEY = "dieta.userPlan";
const USER_ID_KEY = "dieta.userId";
const DAY_MS = 24 * 60 * 60 * 1000;
const TRIAL_POPUP_START_DAY = 2;
const TRIAL_POPUP_END_DAY = 7;
const TRIAL_POPUP_SIMULATION_QUERY_KEY = "trialMock";
const TRIAL_POPUP_SIMULATION_SECONDS_QUERY_KEY = "trialMockSeconds";
const DEFAULT_TRIAL_POPUP_SIMULATION_SECONDS = 10;
const TRIAL_DAY_ORDINALS_ES = {
  2: "segundo",
  3: "tercer",
  4: "cuarto",
  5: "quinto",
  6: "sexto",
  7: "septimo",
};
const PLAY_SUBSCRIPTIONS_URL = "https://play.google.com/store/account/subscriptions";

const PREMIUM_INFO_PAGE_COPY = {
  es: {
    title: "Premium DietaApp",
    intro: "Todo lo que incluye el plan Premium, explicado de forma clara.",
    offerTitle: "Oferta de lanzamiento v1",
    offerPrimaryCta: "Prueba Premium 7 dias gratis",
    offerLegal: "Luego 4,99 EUR/mes. Cancela cuando quieras.",
    offerChannel: "Alta y gestion de suscripcion solo por Google Play Billing.",
    featuresTitle: "Que incluye Premium",
    features: [
      "Seguimiento diario completo y persistente.",
      "Experiencia sin publicidad.",
      "Avisos personalizados segun progreso.",
      "Recomendaciones y recordatorios avanzados.",
      "Panel privado con estadisticas de evolucion.",
    ],
    linksTitle: "Enlaces utiles",
    links: [
      {
        label: "Gestionar suscripciones en Google Play",
        href: PLAY_SUBSCRIPTIONS_URL,
      },
      {
        label: "Ayuda oficial de pagos y suscripciones",
        href: "https://support.google.com/googleplay/answer/2479637",
      },
      {
        label: "Cancelar o pausar suscripcion",
        href: "https://support.google.com/googleplay/answer/7018481",
      },
    ],
    restoreCta: "Restaurar Premium",
    restoringCta: "Restaurando...",
    restoreSuccess: "Premium restaurado correctamente.",
    restoreNoPremium: "No hay una suscripcion Premium activa para este usuario.",
    restoreNoUser: "No hay usuario vinculado para restaurar.",
    restoreError: "No se pudo restaurar Premium. Intentalo de nuevo.",
    continueCta: "No, seguire con publicidad",
  },
  en: {
    title: "DietaApp Premium",
    intro: "Everything included in Premium, clearly explained.",
    offerTitle: "v1 launch offer",
    offerPrimaryCta: "Try Premium free for 7 days",
    offerLegal: "Then EUR 4.99/month. Cancel anytime.",
    offerChannel: "Subscription signup and management only via Google Play Billing.",
    featuresTitle: "What Premium includes",
    features: [
      "Full persistent daily tracking.",
      "Ad-free experience.",
      "Personalized progress alerts.",
      "Advanced reminders and recommendations.",
      "Private progress stats dashboard.",
    ],
    linksTitle: "Useful links",
    links: [
      {
        label: "Manage Google Play subscriptions",
        href: PLAY_SUBSCRIPTIONS_URL,
      },
      {
        label: "Official billing and subscription help",
        href: "https://support.google.com/googleplay/answer/2479637",
      },
      {
        label: "Cancel or pause a subscription",
        href: "https://support.google.com/googleplay/answer/7018481",
      },
    ],
    restoreCta: "Restore Premium",
    restoringCta: "Restoring...",
    restoreSuccess: "Premium restored successfully.",
    restoreNoPremium: "No active Premium subscription was found for this user.",
    restoreNoUser: "No linked user found to restore.",
    restoreError: "Could not restore Premium. Please try again.",
    continueCta: "No, continue with ads",
  },
  fr: {
    title: "DietaApp Premium",
    intro: "Contenu du plan Premium, explique clairement.",
    offerTitle: "Offre de lancement v1",
    offerPrimaryCta: "Essai Premium gratuit 7 jours",
    offerLegal: "Puis 4,99 EUR/mois. Resiliable a tout moment.",
    offerChannel: "Activation et gestion uniquement via Google Play Billing.",
    featuresTitle: "Ce que Premium inclut",
    features: [
      "Suivi quotidien complet et persistant.",
      "Experience sans publicite.",
      "Alertes personnalisees selon progression.",
      "Rappels et recommandations avances.",
      "Tableau de bord prive de progression.",
    ],
    linksTitle: "Liens utiles",
    links: [
      {
        label: "Gerer les abonnements Google Play",
        href: PLAY_SUBSCRIPTIONS_URL,
      },
      {
        label: "Aide officielle paiements et abonnements",
        href: "https://support.google.com/googleplay/answer/2479637",
      },
      {
        label: "Annuler ou suspendre un abonnement",
        href: "https://support.google.com/googleplay/answer/7018481",
      },
    ],
    restoreCta: "Restaurer Premium",
    restoringCta: "Restauration...",
    restoreSuccess: "Premium restaure avec succes.",
    restoreNoPremium: "Aucun abonnement Premium actif pour cet utilisateur.",
    restoreNoUser: "Aucun utilisateur lie pour restaurer.",
    restoreError: "Impossible de restaurer Premium. Reessayez.",
    continueCta: "Non, continuer avec publicite",
  },
  de: {
    title: "DietaApp Premium",
    intro: "Alles zum Premium-Plan, klar erklaert.",
    offerTitle: "v1 Einfuhrungsangebot",
    offerPrimaryCta: "Premium 7 Tage kostenlos testen",
    offerLegal: "Danach 4,99 EUR/Monat. Jederzeit kundbar.",
    offerChannel: "Abschluss und Verwaltung nur uber Google Play Billing.",
    featuresTitle: "Was Premium umfasst",
    features: [
      "Vollstandiges persistentes Tages-Tracking.",
      "Werbefreie Nutzung.",
      "Personalisierte Fortschritts-Hinweise.",
      "Erweiterte Erinnerungen und Empfehlungen.",
      "Privates Fortschritts-Dashboard.",
    ],
    linksTitle: "Nutzliche Links",
    links: [
      {
        label: "Google Play-Abos verwalten",
        href: PLAY_SUBSCRIPTIONS_URL,
      },
      {
        label: "Offizielle Hilfe zu Zahlungen und Abos",
        href: "https://support.google.com/googleplay/answer/2479637",
      },
      {
        label: "Abo pausieren oder kundigen",
        href: "https://support.google.com/googleplay/answer/7018481",
      },
    ],
    restoreCta: "Premium wiederherstellen",
    restoringCta: "Wird wiederhergestellt...",
    restoreSuccess: "Premium erfolgreich wiederhergestellt.",
    restoreNoPremium: "Keine aktive Premium-Mitgliedschaft fur diesen Nutzer gefunden.",
    restoreNoUser: "Kein verknupfter Nutzer zum Wiederherstellen gefunden.",
    restoreError: "Premium konnte nicht wiederhergestellt werden. Bitte erneut versuchen.",
    continueCta: "Nein, mit Werbung fortfahren",
  },
};

const PREMIUM_SIGNUP_FLOW_COPY = {
  es: {
    title: "Registro nuevo usuario Premium",
    step1: "Paso 1 de 2: completa tus datos basicos",
    step2: "Paso 2 de 2: activa tu prueba en Google Play",
    save: "Guardar datos",
    continueToSubscription: "Continuar a suscripcion",
  },
  en: {
    title: "New Premium user signup",
    step1: "Step 1 of 2: complete your basic details",
    step2: "Step 2 of 2: activate your trial in Google Play",
    save: "Save details",
    continueToSubscription: "Continue to subscription",
  },
  fr: {
    title: "Inscription nouvel utilisateur Premium",
    step1: "Etape 1 sur 2 : completez vos informations de base",
    step2: "Etape 2 sur 2 : activez votre essai sur Google Play",
    save: "Enregistrer les donnees",
    continueToSubscription: "Continuer vers l'abonnement",
  },
  de: {
    title: "Neue Premium-Nutzerregistrierung",
    step1: "Schritt 1 von 2: Basisdaten ausfullen",
    step2: "Schritt 2 von 2: Testversion bei Google Play aktivieren",
    save: "Daten speichern",
    continueToSubscription: "Zur Mitgliedschaft fortfahren",
  },
};

const ADVICE_META_COPY = {
  es: {
    sourceLabel: "Fuente",
    openSource: "Ver fuente",
    reviewLabel: "Ultima revision",
  },
  en: {
    sourceLabel: "Source",
    openSource: "View source",
    reviewLabel: "Last review",
  },
  fr: {
    sourceLabel: "Source",
    openSource: "Voir la source",
    reviewLabel: "Derniere mise a jour",
  },
  de: {
    sourceLabel: "Quelle",
    openSource: "Quelle anzeigen",
    reviewLabel: "Letzte Aktualisierung",
  },
};

const DAILY_OPENING_MESSAGES_ES = [
  "Pequenos pasos, grandes resultados.",
  "Respira y mantente constante hoy.",
  "Tu mejor progreso es no parar.",
  "Prioriza agua y comidas reales.",
  "Comer con calma tambien cuenta.",
  "Hoy toca sumar, no perfeccion.",
  "Dormir bien tambien es dieta.",
  "Un dia bueno empieza en la compra.",
  "Proteina y verduras primero.",
  "Evita el picoteo por impulso.",
  "Caminar hoy te acerca al objetivo.",
  "La adherencia gana a la prisa.",
  "Si fallas en una comida, retoma en la siguiente.",
  "Constancia: el verdadero cambio.",
];

const DEFAULT_NOTICE_PREFERENCES = {
  info: true,
  action: true,
  focus: true,
  spotlight: true,
};
const COVER_ARROW_BY_LANGUAGE = {
  de: flechaDe,
  en: flechaEn,
  es: flechaEs,
  fr: flechaFr,
};

const MEAL_CALORIE_SPLIT = {
  breakfast: 0.2,
  midmorning: 0.1,
  lunch: 0.35,
  snack: 0.1,
  dinner: 0.25,
};

const OPTION_CALORIES_BY_MEAL = {
  breakfast: [205, 210, 190, 210],
  midmorning: [95, 80, 115],
  snack: [120, 130, 115],
};

const I18N = {
  es: {
    meals: {
      breakfast: "Desayuno",
      midmorning: "Media mañana",
      lunch: "Comida",
      snack: "Merienda",
      dinner: "Cena",
    },
    weekOrdinals: [
      "primera",
      "segunda",
      "tercera",
      "cuarta",
      "quinta",
      "sexta",
      "séptima",
      "octava",
    ],
    dayOrdinals: [
      "primer",
      "segundo",
      "tercer",
      "cuarto",
      "quinto",
      "sexto",
      "séptimo",
    ],
    words: {
      week: "semana",
      day: "día",
      menuList: "Listado de menús",
      menuOfDay: "Menú de hoy",
      menuOfProgramDay: "Menú del día {day}",
      viewAllMenus: "ver todos los menús",
      preview: "Vista previa",
      options: "Opciones",
      noData: "Sin datos para esta comida.",
      recipe: "Receta",
      dietsProgram: "Elige tu dieta de 8 semanas",
      selectDiet: "Selecciona la dieta.",
      backHome: "Volver a inicio",
      backToTop: "Volver al principio",
      exploreHint: "Explora cualquier día sin cambiar el automático.",
      tipsTitle: "Consejos y recomendaciones\npara ayudar en tu dieta",
      tipsHint: "Selecciona un consejo y abre su texto.",
      tipsMenu: "Información útil",
      goToTip: "Ir al texto del consejo",
      openDoc: "Abrir documento completo",
      languages: "Idiomas",
      chooseLanguage: "Elige idioma",
      links: "Links",
      comingSoon: "Sección en preparación.",
      sectionUnavailable: "Sección no disponible",
      totalCaloriesLabel: "Total: {calories} kcal",
      programStart: "Inicio del programa",
      programDay: "Día del programa",
      programStartsIn: "Empieza en {days} días",
    },
  },
  en: {
    meals: {
      breakfast: "Breakfast",
      midmorning: "Mid-morning",
      lunch: "Lunch",
      snack: "Snack",
      dinner: "Dinner",
    },
    weekOrdinals: [
      "first",
      "second",
      "third",
      "fourth",
      "fifth",
      "sixth",
      "seventh",
      "eighth",
    ],
    dayOrdinals: [
      "first",
      "second",
      "third",
      "fourth",
      "fifth",
      "sixth",
      "seventh",
    ],
    words: {
      week: "week",
      day: "day",
      menuList: "Menu list",
      menuOfDay: "Today menu",
      menuOfProgramDay: "Menu for day {day}",
      viewAllMenus: "view all menus",
      preview: "Preview",
      options: "Options",
      noData: "No data for this meal.",
      recipe: "Recipe",
      dietsProgram: "8-week diet program",
      selectDiet: "Select a diet.",
      backHome: "Back to home",
      backToTop: "Back to top",
      exploreHint: "Explore any day without changing the automatic menu.",
      tipsTitle: "Nutrition tips",
      tipsHint: "Select a tip and open its text.",
      tipsMenu: "Tips menu",
      goToTip: "Go to tip text",
      openDoc: "Open full document",
      languages: "Languages",
      chooseLanguage: "Choose language",
      links: "Links",
      comingSoon: "Section in progress.",
      sectionUnavailable: "Section not available",
      totalCaloriesLabel: "Total: {calories} kcal",
      programStart: "Program start",
      programDay: "Program day",
      programStartsIn: "Starts in {days} days",
    },
  },
  fr: {
    meals: {
      breakfast: "Petit-déjeuner",
      midmorning: "Milieu de matinée",
      lunch: "Déjeuner",
      snack: "Goûter",
      dinner: "Dîner",
    },
    weekOrdinals: [
      "première",
      "deuxième",
      "troisième",
      "quatrième",
      "cinquième",
      "sixième",
      "septième",
      "huitième",
    ],
    dayOrdinals: [
      "premier",
      "deuxième",
      "troisième",
      "quatrième",
      "cinquième",
      "sixième",
      "septième",
    ],
    words: {
      week: "semaine",
      day: "jour",
      menuList: "Liste des menus",
      menuOfDay: "Menu du jour",
      menuOfProgramDay: "Menu du jour {day}",
      viewAllMenus: "voir tous les menus",
      preview: "Aperçu",
      options: "Options",
      noData: "Aucune donnée pour ce repas.",
      recipe: "Recette",
      dietsProgram: "Programme de régimes sur 8 semaines",
      selectDiet: "Sélectionnez un régime.",
      backHome: "Retour à l’accueil",
      backToTop: "Retour en haut",
      exploreHint:
        "Explorez n’importe quel jour sans changer le menu automatique.",
      tipsTitle: "Conseils nutritionnels",
      tipsHint: "Sélectionnez un conseil et ouvrez son texte.",
      tipsMenu: "Menu des conseils",
      goToTip: "Aller au texte",
      openDoc: "Ouvrir le document complet",
      languages: "Langues",
      chooseLanguage: "Choisissez la langue",
      links: "Liens",
      comingSoon: "Section en préparation.",
      sectionUnavailable: "Section non disponible",
      totalCaloriesLabel: "Total : {calories} kcal",
      programStart: "Début du programme",
      programDay: "Jour du programme",
      programStartsIn: "Commence dans {days} jours",
    },
  },
  de: {
    meals: {
      breakfast: "Frühstück",
      midmorning: "Vormittag",
      lunch: "Mittagessen",
      snack: "Snack",
      dinner: "Abendessen",
    },
    weekOrdinals: [
      "erste",
      "zweite",
      "dritte",
      "vierte",
      "fünfte",
      "sechste",
      "siebte",
      "achte",
    ],
    dayOrdinals: [
      "erster",
      "zweiter",
      "dritter",
      "vierter",
      "fünfter",
      "sechster",
      "siebter",
    ],
    words: {
      week: "Woche",
      day: "Tag",
      menuList: "Menüliste",
      menuOfDay: "Tagesmenü",
      menuOfProgramDay: "Menü für Tag {day}",
      viewAllMenus: "alle Menüs anzeigen",
      preview: "Vorschau",
      options: "Optionen",
      noData: "Keine Daten für diese Mahlzeit.",
      recipe: "Rezept",
      dietsProgram: "8‑Wochen‑Diätprogramm",
      selectDiet: "Diät auswählen.",
      backHome: "Zur Startseite",
      backToTop: "Nach oben",
      exploreHint:
        "Beliebigen Tag ansehen, ohne das automatische Menü zu ändern.",
      tipsTitle: "Ernährungstipps",
      tipsHint: "Wähle einen Tipp und öffne den Text.",
      tipsMenu: "Tipps-Menü",
      goToTip: "Zum Tipptext",
      openDoc: "Vollständiges Dokument öffnen",
      languages: "Sprachen",
      chooseLanguage: "Sprache wählen",
      links: "Links",
      comingSoon: "Bereich in Vorbereitung.",
      sectionUnavailable: "Bereich nicht verfügbar",
      totalCaloriesLabel: "Gesamt: {calories} kcal",
      programStart: "Programmstart",
      programDay: "Programmtag",
      programStartsIn: "Startet in {days} Tagen",
    },
  },
};

const NOTICE_COPY = {
  es: {
    title: "Avisos y mensajes",
    intro:
      "Centro de avisos del programa. Aqui veras recordatorios y mensajes utiles segun tu dieta actual.",
    unreadLabel: "Avisos sin leer",
    notificationsOff:
      "Los avisos estan desactivados. Activalos para volver a recibir recordatorios.",
    enableToggle: "Activar avisos y mensajes",
    markRead: "Marcar como leido",
    resetRead: "Restaurar avisos leidos",
    openCenter: "Abrir avisos",
    allRead: "Todo al dia. No hay avisos pendientes.",
    faqTitle: "FAQ de avisos",
    faqIntro: "Preguntas frecuentes sobre mensajes, avisos y recomendaciones.",
    faq: [
      {
        question: "Como funciona este centro de avisos?",
        answer:
          "Los avisos se generan dentro de la app segun la dieta activa y el dia del programa. Puedes marcarlos como leidos cuando ya los hayas revisado.",
      },
      {
        question: "Se envian notificaciones push al movil?",
        answer:
          "Todavia no. En esta fase son avisos visuales in-app para mantener el seguimiento diario.",
      },
      {
        question: "Puedo recuperar avisos que ya marque como leidos?",
        answer:
          "Si. Usa el boton de restaurar para volver a mostrar todos los avisos del centro.",
      },
    ],
    noticeTemplates: {
      welcomeTitle: "Bienvenida al programa",
      welcomeBody:
        "Empieza con calma y constancia: el objetivo es consolidar habitos sostenibles durante ocho semanas.",
      todayTitle: "Menu recomendado para hoy",
      todayBody:
        "Sigue el menu del dia correspondiente a {label}. Mantener la secuencia mejora el control del plan.",
      dietTitle: "Dieta activa",
      dietBody:
        "Tienes seleccionada la dieta de {calories} kcal. Revisa hidratacion, horarios y raciones para afinar resultados.",
      tipsTitle: "Apoyo adicional",
      tipsBody:
        "Consulta la seccion de consejos para resolver dudas comunes y reforzar la adherencia al plan.",
    },
    typeInfo: "Informacion",
    typeAction: "Accion recomendada",
    typeFocus: "Seguimiento",
    typeReminder: "Recordatorio",
    typeMessage: "Mensaje",
    reminderMissingTitle: "Pendiente de ayer",
    reminderMissingBody:
      "No registraste los hitos del dia anterior. Completa el seguimiento para mantener la continuidad.",
    reminderReplyTitle: "Respuesta disponible",
    reminderReplyBody: "Tienes una respuesta a uno de tus comentarios.",
    messageTitle: "Mensaje para abrir el dia",
    infoCaloriesTitle: "Calorias del dia anterior",
    dailyMessages: DAILY_OPENING_MESSAGES_ES,
    dataConsentLead:
      "Si no has autorizado el envio de datos estadisticos, aqui puedes hacerlo.",
    dataConsentLink: "Autorizar aqui",
    dataConsentTitle: "Autorizacion de datos estadisticos",
    dataConsentBody:
      "Introduce alias, pais y edad para crear tu usuario estadistico anonimo.",
    dataConsentSave: "Guardar autorizacion",
    dataConsentDone: "Envio de datos estadisticos autorizado.",
    dataConsentSaved: "Datos estadisticos guardados correctamente.",
    dataConsentFailed: "No se pudo enviar. Intentalo de nuevo.",
    preferencesTitle: "Preferencias de avisos",
    preferencesIntro: "Elige que tipos de mensajes quieres mostrar en el centro.",
    prefInfo: "Mostrar mensajes informativos",
    prefAction: "Mostrar acciones recomendadas",
    prefFocus: "Mostrar mensajes de seguimiento",
    prefSpotlight: "Mostrar aviso destacado en inicio",
    consultTitle: "Consulta rapida",
    consultIntro: "Deja una consulta y quedara guardada localmente para tu seguimiento.",
    consultPlaceholder: "Escribe aqui tu duda o comentario...",
    consultSubmit: "Guardar consulta",
    consultEmpty: "Escribe una consulta antes de guardar.",
    consultHistoryTitle: "Historial local de consultas",
    consultHistoryEmpty: "Aun no hay consultas guardadas.",
    consultClear: "Borrar historial",
    consultSavedLocal: "Consulta guardada localmente.",
    consultSentRemote: "Consulta enviada al backend.",
    consultQueuedRemote: "Sin backend configurado: consulta guardada en local.",
    consultRemoteError: "No se pudo enviar al backend. Queda guardada localmente.",
    consultRoutingInfo:
      "Las consultas se envian por POST a VITE_API_BASE_URL/consults cuando hay backend configurado. Si no, se guardan en local.",
    pushTitle: "Estado de notificaciones",
    pushEnable: "Activar permisos de notificacion",
    pushReady: "Notificaciones disponibles.",
    pushPrompt: "Permiso pendiente de activacion.",
    pushDenied: "Permiso denegado por el navegador/sistema.",
    pushUnavailable: "Notificaciones no disponibles en este dispositivo.",
  },
  en: {
    title: "Alerts and messages",
    intro:
      "Program alert center. Here you can review reminders and useful messages based on your current diet.",
    unreadLabel: "Unread alerts",
    notificationsOff: "Alerts are disabled. Enable them to receive reminders again.",
    enableToggle: "Enable in-app alerts",
    markRead: "Mark as read",
    resetRead: "Restore read alerts",
    openCenter: "Open alerts",
    allRead: "All caught up. No pending alerts.",
    faqTitle: "Alerts FAQ",
    faqIntro: "Frequently asked questions about messages, alerts and recommendations.",
    faq: [
      {
        question: "How does this alert center work?",
        answer:
          "Alerts are generated inside the app based on the active diet and the current program day. You can mark them as read at any time.",
      },
      {
        question: "Does it send push notifications?",
        answer:
          "Not yet. In this phase, alerts are visual and in-app only.",
      },
      {
        question: "Can I restore alerts I already read?",
        answer: "Yes. Use the restore button to show all alerts again.",
      },
    ],
    noticeTemplates: {
      welcomeTitle: "Welcome to the program",
      welcomeBody:
        "Start steady and consistent: the goal is to build sustainable habits over eight weeks.",
      todayTitle: "Recommended menu for today",
      todayBody:
        "Follow the menu assigned to {label}. Keeping sequence improves plan consistency.",
      dietTitle: "Active diet",
      dietBody:
        "You selected the {calories} kcal plan. Review hydration, timing and portions to improve results.",
      tipsTitle: "Extra support",
      tipsBody: "Check the tips section to solve common questions and reinforce adherence.",
    },
    typeInfo: "Info",
    typeAction: "Recommended action",
    typeFocus: "Tracking",
    typeReminder: "Reminder",
    typeMessage: "Message",
    reminderMissingTitle: "Pending from yesterday",
    reminderMissingBody:
      "You did not log yesterday's milestones. Complete tracking to keep continuity.",
    reminderReplyTitle: "Reply available",
    reminderReplyBody: "You have a reply to one of your comments.",
    messageTitle: "Opening message",
    infoCaloriesTitle: "Previous day calories",
    dailyMessages: [
      "Small steps, big results.",
      "Breathe and stay consistent today.",
      "Your best progress is to keep going.",
      "Prioritize water and real food.",
      "Eating calmly also counts.",
      "Today is for progress, not perfection.",
      "Sleeping well is part of the plan.",
      "A good day starts at shopping time.",
      "Protein and vegetables first.",
      "Avoid impulse snacking.",
      "Walking today moves you forward.",
      "Consistency beats speed.",
      "If one meal fails, restart at the next one.",
      "Consistency creates change.",
    ],
    dataConsentLead:
      "If you have not authorized statistical data sharing yet, you can do it here.",
    dataConsentLink: "Authorize now",
    dataConsentTitle: "Statistical data consent",
    dataConsentBody:
      "Enter alias, country and age to create your anonymous statistical profile.",
    dataConsentSave: "Save consent",
    dataConsentDone: "Statistical data sharing authorized.",
    dataConsentSaved: "Statistical data saved successfully.",
    dataConsentFailed: "Could not send data. Please try again.",
    preferencesTitle: "Alert preferences",
    preferencesIntro: "Choose which message types are shown in the center.",
    prefInfo: "Show informational messages",
    prefAction: "Show recommended actions",
    prefFocus: "Show tracking messages",
    prefSpotlight: "Show home spotlight alert",
    consultTitle: "Quick question",
    consultIntro: "Write a question and keep it locally for follow-up.",
    consultPlaceholder: "Type your question or note...",
    consultSubmit: "Save question",
    consultEmpty: "Write a question before saving.",
    consultHistoryTitle: "Local question history",
    consultHistoryEmpty: "No saved questions yet.",
    consultClear: "Clear history",
    consultSavedLocal: "Question saved locally.",
    consultSentRemote: "Question sent to backend.",
    consultQueuedRemote: "No backend configured: saved locally.",
    consultRemoteError: "Could not send to backend. Stored locally.",
    consultRoutingInfo:
      "Questions are sent via POST to VITE_API_BASE_URL/consults when backend is configured. Otherwise they are stored locally.",
    pushTitle: "Notifications status",
    pushEnable: "Enable notification permission",
    pushReady: "Notifications available.",
    pushPrompt: "Permission pending activation.",
    pushDenied: "Permission denied by browser/system.",
    pushUnavailable: "Notifications are not available on this device.",
  },
  fr: {
    title: "Alertes et messages",
    intro:
      "Centre d alertes du programme. Vous y trouverez des rappels et des messages utiles selon votre regime actuel.",
    unreadLabel: "Alertes non lues",
    notificationsOff:
      "Les alertes sont desactivees. Activez-les pour recevoir de nouveaux rappels.",
    enableToggle: "Activer les alertes in-app",
    markRead: "Marquer comme lu",
    resetRead: "Restaurer les alertes lues",
    openCenter: "Ouvrir les alertes",
    allRead: "Tout est a jour. Aucune alerte en attente.",
    faqTitle: "FAQ des alertes",
    faqIntro: "Questions frequentes sur les messages, alertes et recommandations.",
    faq: [
      {
        question: "Comment fonctionne ce centre d alertes ?",
        answer:
          "Les alertes sont generees dans l application selon le regime actif et le jour du programme. Vous pouvez les marquer comme lues.",
      },
      {
        question: "Y a-t-il des notifications push ?",
        answer:
          "Pas encore. Dans cette phase, les alertes sont visuelles et internes a l application.",
      },
      {
        question: "Puis-je recuperer les alertes deja lues ?",
        answer:
          "Oui. Utilisez le bouton de restauration pour afficher de nouveau toutes les alertes.",
      },
    ],
    noticeTemplates: {
      welcomeTitle: "Bienvenue dans le programme",
      welcomeBody:
        "Commencez avec regularite : l objectif est de consolider des habitudes durables pendant huit semaines.",
      todayTitle: "Menu recommande pour aujourd hui",
      todayBody:
        "Suivez le menu associe a {label}. Respecter la sequence ameliore la regularite du plan.",
      dietTitle: "Regime actif",
      dietBody:
        "Vous avez selectionne le plan a {calories} kcal. Verifiez hydratation, horaires et portions.",
      tipsTitle: "Support complementaire",
      tipsBody:
        "Consultez la section conseils pour resoudre les questions frequentes et renforcer l adherence.",
    },
    typeInfo: "Information",
    typeAction: "Action recommandee",
    typeFocus: "Suivi",
    typeReminder: "Rappel",
    typeMessage: "Message",
    reminderMissingTitle: "En attente depuis hier",
    reminderMissingBody:
      "Vous n avez pas enregistre les etapes d hier. Completez le suivi pour garder la continuite.",
    reminderReplyTitle: "Reponse disponible",
    reminderReplyBody: "Vous avez une reponse a l un de vos commentaires.",
    messageTitle: "Message d ouverture",
    infoCaloriesTitle: "Calories de la veille",
    dailyMessages: [
      "De petits pas donnent de grands resultats.",
      "Respirez et restez regulier aujourd hui.",
      "Votre meilleur progres est de continuer.",
      "Priorisez l eau et les aliments reels.",
      "Manger avec calme compte aussi.",
      "Aujourd hui on avance, pas la perfection.",
      "Bien dormir fait partie du plan.",
      "Une bonne journee commence aux courses.",
      "Proteines et legumes en premier.",
      "Evitez le grignotage impulsif.",
      "Marcher aujourd hui vous rapproche de l objectif.",
      "La regularite bat la vitesse.",
      "Si un repas deraille, reprenez au suivant.",
      "La regularite cree le changement.",
    ],
    dataConsentLead:
      "Si vous n avez pas encore autorise l envoi de donnees statistiques, vous pouvez le faire ici.",
    dataConsentLink: "Autoriser maintenant",
    dataConsentTitle: "Autorisation des donnees statistiques",
    dataConsentBody:
      "Indiquez alias, pays et age pour creer votre profil statistique anonyme.",
    dataConsentSave: "Enregistrer l autorisation",
    dataConsentDone: "Envoi des donnees statistiques autorise.",
    dataConsentSaved: "Donnees statistiques enregistrees avec succes.",
    dataConsentFailed: "Envoi impossible. Reessayez.",
    preferencesTitle: "Preferences d alertes",
    preferencesIntro: "Choisissez les types de messages a afficher dans le centre.",
    prefInfo: "Afficher les messages informatifs",
    prefAction: "Afficher les actions recommandees",
    prefFocus: "Afficher les messages de suivi",
    prefSpotlight: "Afficher l alerte en vedette sur l accueil",
    consultTitle: "Question rapide",
    consultIntro: "Ecrivez une question et conservez-la localement pour le suivi.",
    consultPlaceholder: "Ecrivez ici votre question ou remarque...",
    consultSubmit: "Enregistrer la question",
    consultEmpty: "Ecrivez une question avant d enregistrer.",
    consultHistoryTitle: "Historique local des questions",
    consultHistoryEmpty: "Aucune question enregistree.",
    consultClear: "Effacer l historique",
    consultSavedLocal: "Question enregistree localement.",
    consultSentRemote: "Question envoyee au backend.",
    consultQueuedRemote: "Backend non configure : enregistrement local effectue.",
    consultRemoteError: "Envoi backend impossible. Sauvegarde locale conservee.",
    consultRoutingInfo:
      "Les questions sont envoyees via POST a VITE_API_BASE_URL/consults quand le backend est configure. Sinon, elles sont conservees localement.",
    pushTitle: "Etat des notifications",
    pushEnable: "Activer l autorisation de notification",
    pushReady: "Notifications disponibles.",
    pushPrompt: "Autorisation en attente d activation.",
    pushDenied: "Autorisation refusee par le navigateur/systeme.",
    pushUnavailable: "Notifications non disponibles sur cet appareil.",
  },
  de: {
    title: "Hinweise und Nachrichten",
    intro:
      "Hinweiszentrum des Programms. Hier sehen Sie Erinnerungen und nutzliche Nachrichten passend zu Ihrer aktuellen Diat.",
    unreadLabel: "Ungelesene Hinweise",
    notificationsOff:
      "Hinweise sind deaktiviert. Aktivieren Sie sie, um wieder Erinnerungen zu erhalten.",
    enableToggle: "In-App-Hinweise aktivieren",
    markRead: "Als gelesen markieren",
    resetRead: "Gelesene Hinweise wiederherstellen",
    openCenter: "Hinweise offnen",
    allRead: "Alles erledigt. Keine offenen Hinweise.",
    faqTitle: "Hinweise FAQ",
    faqIntro: "Haufige Fragen zu Nachrichten, Hinweisen und Empfehlungen.",
    faq: [
      {
        question: "Wie funktioniert dieses Hinweiszentrum?",
        answer:
          "Hinweise werden in der App anhand der aktiven Diat und des Programmtages erzeugt. Sie konnen Hinweise als gelesen markieren.",
      },
      {
        question: "Gibt es Push-Benachrichtigungen?",
        answer:
          "Noch nicht. In dieser Phase sind Hinweise nur visuell innerhalb der App.",
      },
      {
        question: "Kann ich gelesene Hinweise wieder anzeigen?",
        answer:
          "Ja. Nutzen Sie die Wiederherstellen-Schaltflache, um alle Hinweise erneut zu sehen.",
      },
    ],
    noticeTemplates: {
      welcomeTitle: "Willkommen im Programm",
      welcomeBody:
        "Starten Sie ruhig und konsequent: Ziel sind nachhaltige Gewohnheiten uber acht Wochen.",
      todayTitle: "Empfohlenes Menu fur heute",
      todayBody:
        "Folgen Sie dem Menu fur {label}. Eine stabile Reihenfolge verbessert die Plan-Treue.",
      dietTitle: "Aktive Diat",
      dietBody:
        "Sie haben den {calories} kcal Plan gewahlt. Achten Sie auf Flussigkeit, Zeiten und Portionen.",
      tipsTitle: "Zusatzliche Unterstutzung",
      tipsBody:
        "Nutzen Sie den Tipps-Bereich fur haufige Fragen und eine bessere Umsetzung des Plans.",
    },
    typeInfo: "Info",
    typeAction: "Empfohlene Aktion",
    typeFocus: "Verlauf",
    typeReminder: "Erinnerung",
    typeMessage: "Nachricht",
    reminderMissingTitle: "Offen seit gestern",
    reminderMissingBody:
      "Die Meilensteine von gestern wurden nicht erfasst. Bitte vervollstandigen Sie das Tracking fur einen stabilen Verlauf.",
    reminderReplyTitle: "Antwort verfugbar",
    reminderReplyBody: "Sie haben eine Antwort auf einen Ihrer Kommentare.",
    messageTitle: "Tagesauftakt",
    infoCaloriesTitle: "Kalorien vom Vortag",
    dailyMessages: [
      "Kleine Schritte, grosse Ergebnisse.",
      "Atmen Sie durch und bleiben Sie heute dran.",
      "Ihr bester Fortschritt ist dranzubleiben.",
      "Wasser und echte Lebensmittel zuerst.",
      "Ruhig essen zahlt auch.",
      "Heute zahlt Fortschritt, nicht Perfektion.",
      "Guter Schlaf ist Teil des Plans.",
      "Ein guter Tag beginnt beim Einkauf.",
      "Proteine und Gemuse zuerst.",
      "Vermeiden Sie impulsives Snacken.",
      "Ein Spaziergang bringt Sie heute weiter.",
      "Konstanz schlagt Tempo.",
      "Wenn eine Mahlzeit ausfallt, bei der nachsten weitermachen.",
      "Konstanz schafft Veranderung.",
    ],
    dataConsentLead:
      "Wenn Sie die statistische Datenfreigabe noch nicht aktiviert haben, konnen Sie das hier tun.",
    dataConsentLink: "Jetzt autorisieren",
    dataConsentTitle: "Freigabe statistischer Daten",
    dataConsentBody:
      "Geben Sie Alias, Land und Alter ein, um ein anonymes Statistikprofil zu erstellen.",
    dataConsentSave: "Freigabe speichern",
    dataConsentDone: "Statistische Datenfreigabe aktiviert.",
    dataConsentSaved: "Statistische Daten erfolgreich gespeichert.",
    dataConsentFailed: "Senden nicht moglich. Bitte erneut versuchen.",
    preferencesTitle: "Hinweis-Einstellungen",
    preferencesIntro: "Wahlen Sie, welche Nachrichtentypen im Zentrum angezeigt werden.",
    prefInfo: "Informationshinweise anzeigen",
    prefAction: "Empfohlene Aktionen anzeigen",
    prefFocus: "Verlaufshinweise anzeigen",
    prefSpotlight: "Hinweis-Karte auf Startseite anzeigen",
    consultTitle: "Kurze Anfrage",
    consultIntro: "Schreiben Sie eine Anfrage und speichern Sie sie lokal fur den Verlauf.",
    consultPlaceholder: "Frage oder Notiz hier eingeben...",
    consultSubmit: "Anfrage speichern",
    consultEmpty: "Bitte erst eine Anfrage eingeben.",
    consultHistoryTitle: "Lokaler Anfrageverlauf",
    consultHistoryEmpty: "Noch keine gespeicherten Anfragen.",
    consultClear: "Verlauf loschen",
    consultSavedLocal: "Anfrage lokal gespeichert.",
    consultSentRemote: "Anfrage an Backend gesendet.",
    consultQueuedRemote: "Kein Backend konfiguriert: lokal gespeichert.",
    consultRemoteError: "Backend-Senden fehlgeschlagen. Lokal gespeichert.",
    consultRoutingInfo:
      "Anfragen werden per POST an VITE_API_BASE_URL/consults gesendet, wenn ein Backend konfiguriert ist. Sonst bleiben sie lokal gespeichert.",
    pushTitle: "Benachrichtigungsstatus",
    pushEnable: "Benachrichtigungsberechtigung aktivieren",
    pushReady: "Benachrichtigungen verfugbar.",
    pushPrompt: "Berechtigung wartet auf Aktivierung.",
    pushDenied: "Berechtigung vom Browser/System abgelehnt.",
    pushUnavailable: "Benachrichtigungen auf diesem Gerat nicht verfugbar.",
  },
};

function getNoticeCopy(language) {
  return NOTICE_COPY[language] ?? NOTICE_COPY.es;
}

const DIET_CONFIGS = {
  es: {
    1400: () => import("./data/menus1400.json"),
    1600: menus1600,
    1800: () => import("./data/menus1800.json"),
    2000: () => import("./data/menus2000.json"),
  },
  en: {
    1400: () => import("./data/i18n/menus1400.en.json"),
    1600: () => import("./data/i18n/menus1600.en.json"),
    1800: () => import("./data/i18n/menus1800.en.json"),
    2000: () => import("./data/i18n/menus2000.en.json"),
  },
  fr: {
    1400: () => import("./data/i18n/menus1400.fr.json"),
    1600: () => import("./data/i18n/menus1600.fr.json"),
    1800: () => import("./data/i18n/menus1800.fr.json"),
    2000: () => import("./data/i18n/menus2000.fr.json"),
  },
  de: {
    1400: () => import("./data/i18n/menus1400.de.json"),
    1600: () => import("./data/i18n/menus1600.de.json"),
    1800: () => import("./data/i18n/menus1800.de.json"),
    2000: () => import("./data/i18n/menus2000.de.json"),
  },
};

const CONSEJOS_CONFIG = {
  es: consejos,
  en: () => import("./data/i18n/consejos.en.json"),
  fr: () => import("./data/i18n/consejos.fr.json"),
  de: () => import("./data/i18n/consejos.de.json"),
};

function buildAllMenus(dietMenus) {
  return (dietMenus?.weeks ?? [])
    .flatMap((week, weekIndex) =>
      (week.days ?? []).map((day, dayIndex) => ({
        weekId: week.id,
        menuNumber: day.menuNumber,
        weekIndex,
        dayIndex,
      })),
    )
    .map((menu, index) => ({ ...menu, internalNumber: index + 1 }));
}

function getStartOfDayTimestamp(dateInput) {
  const date = new Date(dateInput);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function getOrCreateInstallDate() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const fallback = today.toISOString();
  try {
    const stored = localStorage.getItem(INSTALL_DATE_KEY);
    if (stored) return stored;
    localStorage.setItem(INSTALL_DATE_KEY, fallback);
    return fallback;
  } catch {
    return fallback;
  }
}

function getAutomaticMenuSelection(installDate, menuList) {
  if (!menuList.length) return null;
  const todayTimestamp = getStartOfDayTimestamp(new Date());
  const installTimestamp = getStartOfDayTimestamp(installDate);
  const elapsedDays = Math.max(
    0,
    Math.floor((todayTimestamp - installTimestamp) / DAY_MS),
  );
  const currentIndex = elapsedDays % menuList.length;
  return menuList[currentIndex];
}

function getMenuLabel(selection, language) {
  if (!selection) return "";
  const locale = I18N[language] ?? I18N.es;
  const weekOrdinals = locale.weekOrdinals;
  const dayOrdinals = locale.dayOrdinals;
  const weekLabel =
    weekOrdinals[selection.weekIndex] ?? `${selection.weekIndex + 1}ª`;
  const dayLabel =
    dayOrdinals[selection.dayIndex] ?? `${selection.dayIndex + 1}º`;
  return `${weekLabel} ${locale.words.week} - ${dayLabel} ${locale.words.day}`;
}

function formatDietUnavailableMessage(template, calories, fallback) {
  return template
    .replace("{calories}", String(calories))
    .replace("{fallback}", String(fallback));
}

function getMealCalories(totalCalories, mealKey) {
  const split = MEAL_CALORIE_SPLIT[mealKey] ?? 0;
  return Math.round(totalCalories * split);
}

function getOptionCalories(mealKey, optionIndex) {
  return OPTION_CALORIES_BY_MEAL[mealKey]?.[optionIndex] ?? null;
}

function App() {
  const availableDiets = [1400, 1600, 1800, 2000];
  const [installDate] = useState(() => getOrCreateInstallDate());
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    try {
      return localStorage.getItem(LANGUAGE_KEY) ?? "es";
    } catch {
      return "es";
    }
  });
  const [selectedDietCalories, setSelectedDietCalories] = useState(1600);
  const [lazyMenus, setLazyMenus] = useState({});
  const [lazyConsejos, setLazyConsejos] = useState({});
  const [noticesEnabled, setNoticesEnabled] = useState(() => {
    try {
      const stored = localStorage.getItem(NOTICES_ENABLED_KEY);
      if (stored == null) return true;
      return stored === "true";
    } catch {
      return true;
    }
  });
  const [dismissedNoticeIds, setDismissedNoticeIds] = useState(() => {
    try {
      const stored = localStorage.getItem(NOTICES_DISMISSED_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [noticePreferences, setNoticePreferences] = useState(() => {
    try {
      const stored = localStorage.getItem(NOTICE_PREFERENCES_KEY);
      if (!stored) return DEFAULT_NOTICE_PREFERENCES;
      const parsed = JSON.parse(stored);
      return {
        ...DEFAULT_NOTICE_PREFERENCES,
        ...(typeof parsed === "object" && parsed ? parsed : {}),
      };
    } catch {
      return DEFAULT_NOTICE_PREFERENCES;
    }
  });
  const [consultHistory, setConsultHistory] = useState(() => {
    try {
      const stored = localStorage.getItem(CONSULT_HISTORY_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [consultDraft, setConsultDraft] = useState("");
  const [consultFeedback, setConsultFeedback] = useState("");
  const [isSubmittingConsult, setIsSubmittingConsult] = useState(false);
  const [isDataConsentOpen, setIsDataConsentOpen] = useState(false);
  const [isSubmittingDataConsent, setIsSubmittingDataConsent] = useState(false);
  const [statsDataAuthorized, setStatsDataAuthorized] = useState(() => {
    try {
      return localStorage.getItem(STATS_DATA_AUTH_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [statsProfile, setStatsProfile] = useState(() => {
    try {
      const stored = localStorage.getItem(STATS_PROFILE_KEY);
      if (!stored) return { alias: "", country: "", age: "" };
      const parsed = JSON.parse(stored);
      return {
        alias: typeof parsed.alias === "string" ? parsed.alias : "",
        country: typeof parsed.country === "string" ? parsed.country : "",
        age: parsed.age == null ? "" : String(parsed.age),
      };
    } catch {
      return { alias: "", country: "", age: "" };
    }
  });
  const [pushStatus, setPushStatus] = useState("prompt");

  const locale = I18N[selectedLanguage] ?? I18N.es;
  const noticeCopy = useMemo(
    () => getNoticeCopy(selectedLanguage),
    [selectedLanguage],
  );
  const premiumInfoCopy = useMemo(
    () => PREMIUM_INFO_PAGE_COPY[selectedLanguage] ?? PREMIUM_INFO_PAGE_COPY.es,
    [selectedLanguage],
  );
  const premiumSignupFlowCopy = useMemo(
    () => PREMIUM_SIGNUP_FLOW_COPY[selectedLanguage] ?? PREMIUM_SIGNUP_FLOW_COPY.es,
    [selectedLanguage],
  );

  const uiText = useMemo(() => getUiText(selectedLanguage), [selectedLanguage]);
  const coverArrowImage =
    COVER_ARROW_BY_LANGUAGE[selectedLanguage] ?? flechaEs;
  const coverBalloonText = useMemo(() => uiText.coverBalloonText.trim(), [uiText]);
  const coverBalloonAriaLabel = useMemo(
    () => coverBalloonText.replace(/\s*\n+\s*/g, " ").trim(),
    [coverBalloonText],
  );
  const coverBalloonLines = useMemo(
    () => coverBalloonText.split(/\r?\n/),
    [coverBalloonText],
  );

  const mealOrder = useMemo(
    () => [
      { key: "breakfast", label: locale.meals.breakfast, time: "08:00" },
      { key: "midmorning", label: locale.meals.midmorning, time: "11:00" },
      { key: "lunch", label: locale.meals.lunch, time: "14:00" },
      { key: "snack", label: locale.meals.snack, time: "18:00" },
      { key: "dinner", label: locale.meals.dinner, time: "21:00" },
    ],
    [locale.meals],
  );

  useEffect(() => {
    let cancelled = false;

    const loadLanguageData = async () => {
      const menuSource = DIET_CONFIGS[selectedLanguage]?.[selectedDietCalories];
      const menuAlreadyLoaded =
        lazyMenus[selectedLanguage]?.[selectedDietCalories];
      if (!menuAlreadyLoaded && typeof menuSource === "function") {
        const mod = await menuSource();
        if (!cancelled) {
          setLazyMenus((prev) => ({
            ...prev,
            [selectedLanguage]: {
              ...(prev[selectedLanguage] ?? {}),
              [selectedDietCalories]: mod.default ?? mod,
            },
          }));
        }
      }

      if (selectedLanguage !== "es" && !lazyConsejos[selectedLanguage]) {
        const consejosLoader = CONSEJOS_CONFIG[selectedLanguage];
        if (typeof consejosLoader === "function") {
          const mod = await consejosLoader();
          if (!cancelled) {
            setLazyConsejos((prev) => ({
              ...prev,
              [selectedLanguage]: mod.default ?? mod,
            }));
          }
        }
      }
    };

    loadLanguageData();

    return () => {
      cancelled = true;
    };
  }, [lazyConsejos, lazyMenus, selectedDietCalories, selectedLanguage]);

  useEffect(() => {
    const schedule = (callback) => {
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        return window.requestIdleCallback(callback, { timeout: 1200 });
      }
      return window.setTimeout(callback, 500);
    };

    const cancelSchedule = (id) => {
      if (typeof window !== "undefined" && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(id);
        return;
      }
      clearTimeout(id);
    };

    const idleId = schedule(async () => {
      const targets = ["en", "fr", "de"];
      for (const lang of targets) {
        const menuAlreadyLoaded = lazyMenus[lang]?.[selectedDietCalories];
        if (!menuAlreadyLoaded) {
          const menuLoader = DIET_CONFIGS[lang]?.[selectedDietCalories];
          if (typeof menuLoader === "function") {
            const mod = await menuLoader();
            setLazyMenus((prev) => ({
              ...prev,
              [lang]: {
                ...(prev[lang] ?? {}),
                [selectedDietCalories]: mod.default ?? mod,
              },
            }));
          }
        }

        if (!lazyConsejos[lang]) {
          const consejosLoader = CONSEJOS_CONFIG[lang];
          if (typeof consejosLoader === "function") {
            const mod = await consejosLoader();
            setLazyConsejos((prev) => ({
              ...prev,
              [lang]: mod.default ?? mod,
            }));
          }
        }
      }
    });

    return () => cancelSchedule(idleId);
  }, [lazyConsejos, lazyMenus, selectedDietCalories]);

  const menus = useMemo(() => {
    const source = DIET_CONFIGS[selectedLanguage]?.[selectedDietCalories];
    if (typeof source !== "function") {
      return source ?? menus1600;
    }
    return lazyMenus[selectedLanguage]?.[selectedDietCalories] ?? menus1600;
  }, [lazyMenus, selectedDietCalories, selectedLanguage]);

  const consejosList = useMemo(() => {
    if (selectedLanguage === "es") return CONSEJOS_CONFIG.es;
    return lazyConsejos[selectedLanguage] ?? CONSEJOS_CONFIG.es;
  }, [lazyConsejos, selectedLanguage]);

  const allMenus = useMemo(() => buildAllMenus(menus), [menus]);

  const automaticSelection = useMemo(
    () => getAutomaticMenuSelection(installDate, allMenus),
    [allMenus, installDate],
  );

  const [activeView, setActiveView] = useState("home");
  const [userPlan, setUserPlan] = useState(() => {
    try {
      return localStorage.getItem(USER_PLAN_KEY) === "premium"
        ? "premium"
        : "free";
    } catch {
      return "free";
    }
  });
  const [backendUserId, setBackendUserId] = useState(() => {
    try {
      return localStorage.getItem(USER_ID_KEY) || "";
    } catch {
      return "";
    }
  });
  const [showPortada, setShowPortada] = useState(true);
  const [dietNotice, setDietNotice] = useState("");
  const [selectedConsejoId, setSelectedConsejoId] = useState(1);
  const [isImcOpen, setIsImcOpen] = useState(false);
  const [imcInitialFlowStep, setImcInitialFlowStep] = useState("calc");
  const [imcDirectCalories, setImcDirectCalories] = useState(null);
  const [programStartIso, setProgramStartIso] = useState(() => {
    try {
      const savedStartDate = localStorage.getItem(PROGRAM_START_DATE_KEY);
      if (!savedStartDate) return "";
      const parsed = new Date(savedStartDate);
      if (Number.isNaN(parsed.getTime())) return "";
      return parsed.toISOString();
    } catch {
      return "";
    }
  });
  const [imcSex, setImcSex] = useState("female");
  const [imcWeight, setImcWeight] = useState("");
  const [imcHeight, setImcHeight] = useState("");
  const [programTrackingSnapshot, setProgramTrackingSnapshot] = useState(() =>
    getLatestProgramSnapshot(),
  );
  const [trialPopupDay, setTrialPopupDay] = useState(null);
  const [isTrialPopupSimulationEnabled, setIsTrialPopupSimulationEnabled] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const value = String(params.get(TRIAL_POPUP_SIMULATION_QUERY_KEY) || "").toLowerCase();
      return ["1", "true", "yes", "on"].includes(value);
    } catch {
      return false;
    }
  });
  const [trialPopupSimulationIntervalMs] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const rawSeconds = Number(params.get(TRIAL_POPUP_SIMULATION_SECONDS_QUERY_KEY));
      const safeSeconds = Number.isFinite(rawSeconds) && rawSeconds > 0
        ? rawSeconds
        : DEFAULT_TRIAL_POPUP_SIMULATION_SECONDS;
      return Math.round(safeSeconds * 1000);
    } catch {
      return DEFAULT_TRIAL_POPUP_SIMULATION_SECONDS * 1000;
    }
  });
  const [pendingMorningCheckin, setPendingMorningCheckin] = useState(() =>
    getPendingMorningCheckin(),
  );
  const [morningMilestones, setMorningMilestones] = useState({
    breakfast: false,
    lunch: false,
    meal: false,
    snack: false,
    dinner: false,
  });
  const [morningNotes, setMorningNotes] = useState("");
  const [latestMorningSummary, setLatestMorningSummary] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isRestoringPremium, setIsRestoringPremium] = useState(false);
  const [premiumRestoreFeedback, setPremiumRestoreFeedback] = useState("");
  const [exploreInternalNumber, setExploreInternalNumber] = useState(
    () => automaticSelection?.internalNumber ?? 1,
  );
  const previewSectionRef = useRef(null);
  const menuListSectionRef = useRef(null);
  const lastPlanHydratedUserIdRef = useRef("");
  const lastPlanSyncedRef = useRef("");

  const homeSelection = automaticSelection ?? allMenus[0] ?? null;

  const exploreSelection = useMemo(
    () =>
      allMenus.find((menu) => menu.internalNumber === exploreInternalNumber) ??
      allMenus[0] ??
      null,
    [allMenus, exploreInternalNumber],
  );

  const selectedSelection =
    activeView === "dietas" ? exploreSelection : homeSelection;
  const effectiveUserId =
    programTrackingSnapshot?.user?.id || backendUserId || "";
  const isPremiumUser = userPlan === "premium";
  const adviceMetaCopy = ADVICE_META_COPY[selectedLanguage] ?? ADVICE_META_COPY.es;
  const visibleConsejosList = useMemo(
    () =>
      isPremiumUser
        ? consejosList
        : consejosList.filter((consejo) => consejo.level !== "premium"),
    [consejosList, isPremiumUser],
  );
  const premiumConsejoCount = useMemo(
    () => consejosList.filter((consejo) => consejo.level === "premium").length,
    [consejosList],
  );

  const programStartLabel = useMemo(() => {
    if (!programStartIso) return "";
    const parsed = new Date(programStartIso);
    if (Number.isNaN(parsed.getTime())) return "";
    const formatted = parsed.toLocaleDateString(
      selectedLanguage === "es" ? "es-ES" : selectedLanguage,
    );
    return `${locale.words.programStart}: ${formatted}`;
  }, [locale.words.programStart, programStartIso, selectedLanguage]);

  const programDayLabel = useMemo(() => {
    if (!programStartIso) return "";

    const startDate = new Date(programStartIso);
    if (Number.isNaN(startDate.getTime())) return "";

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);

    const dayOffset = Math.floor((today.getTime() - startDate.getTime()) / DAY_MS);

    if (dayOffset < 0) {
      return "";
    }

    return `${locale.words.programDay}: ${dayOffset + 1}`;
  }, [locale.words.programDay, programStartIso]);

  const currentWeek = useMemo(
    () =>
      menus.weeks.find((week) => week.id === selectedSelection?.weekId) ??
      menus.weeks[0],
    [menus, selectedSelection],
  );

  const currentDay = useMemo(
    () =>
      currentWeek?.days?.find(
        (day) => day.menuNumber === selectedSelection?.menuNumber,
      ),
    [currentWeek, selectedSelection],
  );

  const formatMenuItem = (text) => {
    const colonIndex = text.indexOf(":");
    if (colonIndex === -1) return text;
    const title = text.substring(0, colonIndex + 1);
    const description = text.substring(colonIndex + 1);
    return (
      <>
        <span className="menu-item-title">{title}</span>
        {description}
      </>
    );
  };

  const formatAdviceInline = (text) =>
    text
      .split(/(\*\*[^*]+\*\*)/g)
      .filter(Boolean)
      .map((part, index) => {
        const isBoldToken = part.startsWith("**") && part.endsWith("**");
        if (isBoldToken) {
          return <strong key={`b-${index}`}>{part.slice(2, -2)}</strong>;
        }
        return <span key={`t-${index}`}>{part}</span>;
      });

  const renderAdviceText = (text) => {
    const paragraphs = text
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);

    return paragraphs.map((paragraph, paragraphIndex) => {
      const lines = paragraph
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      return (
        <p key={`p-${paragraphIndex}`}>
          {lines.map((line, lineIndex) => {
            const titleMatch = line.match(/^([^:]{2,120}:)\s*(.*)$/);
            const content = titleMatch ? (
              <>
                <strong>{titleMatch[1]}</strong>
                {titleMatch[2] ? (
                  <> {formatAdviceInline(titleMatch[2])}</>
                ) : null}
              </>
            ) : (
              formatAdviceInline(line)
            );

            return (
              <span key={`l-${paragraphIndex}-${lineIndex}`}>
                {content}
                {lineIndex < lines.length - 1 ? <br /> : null}
              </span>
            );
          })}
        </p>
      );
    });
  };

  const formatAdviceReviewDate = (reviewedAt) => {
    if (!reviewedAt) return "";
    const parsed = new Date(reviewedAt);
    if (Number.isNaN(parsed.getTime())) return reviewedAt;
    return parsed.toLocaleDateString(
      selectedLanguage === "es" ? "es-ES" : selectedLanguage,
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      },
    );
  };

  const buildMealData = (meal, title, totalCalories) => ({
    title,
    items: meal?.items ?? [],
    ingredients: meal?.ingredients ?? "",
    recipe: meal?.recipe ?? "",
    notes: meal?.notes ?? [],
    totalCalories,
  });

  const menuByMeal = useMemo(
    () => ({
      breakfast: {
        title: locale.words.options,
        items: currentWeek?.breakfastOptions ?? [],
        itemCalories: (currentWeek?.breakfastOptions ?? []).map((_, index) =>
          getOptionCalories("breakfast", index),
        ),
      },
      midmorning: {
        title: locale.words.options,
        items: currentWeek?.midmorningOptions ?? [],
        itemCalories: (currentWeek?.midmorningOptions ?? []).map((_, index) =>
          getOptionCalories("midmorning", index),
        ),
      },
      snack: {
        title: locale.words.options,
        items: currentWeek?.snackOptions ?? [],
        itemCalories: (currentWeek?.snackOptions ?? []).map((_, index) =>
          getOptionCalories("snack", index),
        ),
      },
      lunch: buildMealData(
        currentDay?.lunch,
        "",
        getMealCalories(selectedDietCalories, "lunch"),
      ),
      dinner: buildMealData(
        currentDay?.dinner,
        "",
        getMealCalories(selectedDietCalories, "dinner"),
      ),
    }),
    [currentWeek, currentDay, locale.words.options, selectedDietCalories],
  );

  const selectedMenuLabel = getMenuLabel(selectedSelection, selectedLanguage);
  const selectedConsejo = useMemo(
    () =>
      visibleConsejosList.find((consejo) => consejo.id === selectedConsejoId) ??
      visibleConsejosList[0] ??
      null,
    [visibleConsejosList, selectedConsejoId],
  );

  const notices = useMemo(() => {
    const templates = noticeCopy.noticeTemplates;
    const safeLabel = selectedMenuLabel || getMenuLabel(homeSelection, selectedLanguage);
    const list = [];

    if (pendingMorningCheckin) {
      list.push({
        id: `reminder-missing-${pendingMorningCheckin.trackingDateIso}`,
        type: "reminder",
        title: noticeCopy.reminderMissingTitle ?? "Daily reminder",
        body:
          noticeCopy.reminderMissingBody ??
          "You did not log yesterday's milestones. Complete tracking to keep progress.",
      });
    }

    const repliedConsult = consultHistory.find((entry) => Boolean(entry.replyText));
    if (repliedConsult) {
      list.push({
        id: `reminder-reply-${repliedConsult.id}`,
        type: "reminder",
        title: noticeCopy.reminderReplyTitle ?? "Reply available",
        body:
          noticeCopy.reminderReplyBody ??
          "There is a reply available for one of your quick consult comments.",
      });
    }

    const dailyMessages = Array.isArray(noticeCopy.dailyMessages) && noticeCopy.dailyMessages.length
      ? noticeCopy.dailyMessages
      : DAILY_OPENING_MESSAGES_ES;
    const messageIndexBase = Math.max(0, (programTrackingSnapshot?.dayIndex ?? 1) - 1);
    const openingMessage = dailyMessages[messageIndexBase % dailyMessages.length];
    list.push({
      id: `message-day-${messageIndexBase}`,
      type: "message",
      title: noticeCopy.messageTitle ?? "Message of the day",
      body: openingMessage,
    });

    list.push({
      id: `info-menu-${selectedSelection?.weekIndex ?? 0}-${selectedSelection?.dayIndex ?? 0}`,
      type: "info",
      title: templates.todayTitle,
      body: templates.todayBody.replace("{label}", safeLabel || ""),
    });

    list.push({
      id: `info-diet-${selectedDietCalories}`,
      type: "info",
      title: templates.dietTitle,
      body: templates.dietBody.replace("{calories}", String(selectedDietCalories)),
    });

    if (latestMorningSummary) {
      list.push({
        id: `info-calories-${latestMorningSummary.id}`,
        type: "info",
        title: noticeCopy.infoCaloriesTitle ?? "Calorie summary",
        body: `${uiText.morningCaloriesTotal}: ${latestMorningSummary.totalCalories} kcal. ${uiText.morningCaloriesSaved}: ${latestMorningSummary.caloriesSaved} kcal. ${uiText.morningCaloriesExtra}: ${latestMorningSummary.caloriesExtra} kcal.`,
      });
    }

    list.push({
      id: "info-support",
      type: "info",
      title: templates.tipsTitle,
      body: templates.tipsBody,
    });

    return list;
  }, [
    consultHistory,
    homeSelection,
    latestMorningSummary,
    noticeCopy.noticeTemplates,
    noticeCopy.dailyMessages,
    noticeCopy.infoCaloriesTitle,
    noticeCopy.messageTitle,
    noticeCopy.reminderMissingBody,
    noticeCopy.reminderMissingTitle,
    noticeCopy.reminderReplyBody,
    noticeCopy.reminderReplyTitle,
    pendingMorningCheckin,
    programTrackingSnapshot?.dayIndex,
    selectedDietCalories,
    selectedLanguage,
    selectedMenuLabel,
    selectedSelection?.dayIndex,
    selectedSelection?.weekIndex,
    uiText.morningCaloriesExtra,
    uiText.morningCaloriesSaved,
    uiText.morningCaloriesTotal,
  ]);

  const unreadNotices = useMemo(
    () =>
      noticesEnabled
        ? notices.filter(
            (notice) => !dismissedNoticeIds.includes(notice.id),
          )
        : [],
    [dismissedNoticeIds, notices, noticesEnabled],
  );

  const unreadBadgeCount = useMemo(() => {
    if (!isPremiumUser || !noticesEnabled) return 0;
    return notices.filter(
      (notice) =>
        (notice.type === "reminder" || notice.type === "message") &&
        !dismissedNoticeIds.includes(notice.id),
    ).length;
  }, [dismissedNoticeIds, isPremiumUser, notices, noticesEnabled]);

  const pushStatusLabel = useMemo(() => {
    if (pushStatus === "ready") return noticeCopy.pushReady;
    if (pushStatus === "denied") return noticeCopy.pushDenied;
    if (pushStatus === "unavailable") return noticeCopy.pushUnavailable;
    return noticeCopy.pushPrompt;
  }, [noticeCopy, pushStatus]);
  const formattedDate = useMemo(() => {
    let dateToFormat = new Date();

    if (programStartIso) {
      const startDate = new Date(programStartIso);
      if (!Number.isNaN(startDate.getTime())) {
        const menuOffset = Math.max(
          0,
          (selectedSelection?.internalNumber ?? 1) - 1,
        );
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(startDate.getDate() + menuOffset);
        dateToFormat = startDate;
      }
    }

    return dateToFormat.toLocaleDateString(
      selectedLanguage === "es" ? "es-ES" : selectedLanguage,
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      },
    );
  }, [programStartIso, selectedLanguage, selectedSelection?.internalNumber]);

  const menuHeaderTitle = useMemo(() => {
    const dayNumber = String(selectedSelection?.internalNumber ?? 1);
    const template = locale.words.menuOfProgramDay || locale.words.menuOfDay;
    if (template.includes("{day}")) {
      return template.replace("{day}", dayNumber);
    }
    return `${template} ${dayNumber}`;
  }, [locale.words.menuOfDay, locale.words.menuOfProgramDay, selectedSelection?.internalNumber]);
  const imcValue = useMemo(() => {
    const weight = Number(String(imcWeight).replace(",", "."));
    const heightCm = Number(String(imcHeight).replace(",", "."));
    if (!weight || !heightCm || heightCm <= 0) return null;
    const heightMeters = heightCm / 100;
    return weight / (heightMeters * heightMeters);
  }, [imcHeight, imcWeight]);

  const imcCategory = useMemo(() => {
    if (imcValue == null) return "";
    if (imcValue < 18) return uiText.underweight;
    if (imcValue <= 25) return uiText.normalWeight;
    if (imcValue <= 30) return uiText.overweight;
    return uiText.obesity;
  }, [imcValue, uiText]);

  const imcRecommendation = useMemo(() => {
    if (imcValue == null) return null;
    if (imcSex === "female") {
      if (imcValue < 18) return 2000;
      if (imcValue <= 25) return 1800;
      if (imcValue <= 30) return 1600;
      return 1400;
    }
    if (imcValue < 18) return 2000;
    if (imcValue <= 25) return 2000;
    if (imcValue <= 30) return 1800;
    return 1600;
  }, [imcSex, imcValue]);

  const handleExploreSelect = (internalNumber) => {
    setExploreInternalNumber(internalNumber);
    requestAnimationFrame(() => {
      if (!previewSectionRef.current) return;
      previewSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const handleBackToHome = () => {
    setActiveView("home");
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const handleEnterFromPortada = () => {
    setShowPortada(false);
    setActiveView("home");
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const handleBackToPortada = () => {
    setShowPortada(true);
    setIsImcOpen(false);
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const handleGoToConsejos = () => {
    setActiveView("tips");
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const handleGoToDietas = () => {
    setActiveView("dietas");
    setDietNotice("");
    setExploreInternalNumber(1);
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const handleGoToIdiomas = () => {
    setActiveView("idiomas");
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const handleOpenPremiumInfo = useCallback(() => {
    setIsImcOpen(false);
    setActiveView("links");
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }, []);

  const getLastSeenTrialPopupDay = useCallback((programId) => {
    if (!programId) return 0;
    try {
      const raw = localStorage.getItem(TRIAL_POPUP_LAST_SEEN_DAY_KEY);
      if (!raw) return 0;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return 0;
      const savedDay = Number(parsed[programId]);
      return Number.isFinite(savedDay) ? savedDay : 0;
    } catch {
      return 0;
    }
  }, []);

  const markTrialPopupSeen = useCallback((programId, dayIndex) => {
    if (!programId) return;
    if (!Number.isFinite(dayIndex) || dayIndex < TRIAL_POPUP_START_DAY) return;
    try {
      const raw = localStorage.getItem(TRIAL_POPUP_LAST_SEEN_DAY_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      const current = Number(parsed?.[programId]) || 0;
      const next = Math.max(current, Math.floor(dayIndex));
      localStorage.setItem(
        TRIAL_POPUP_LAST_SEEN_DAY_KEY,
        JSON.stringify({
          ...(parsed && typeof parsed === "object" ? parsed : {}),
          [programId]: next,
        }),
      );
    } catch {
      // ignore storage errors
    }
  }, []);

  const handleCloseTrialPopup = useCallback(() => {
    if (!isTrialPopupSimulationEnabled) {
      markTrialPopupSeen(
        programTrackingSnapshot?.program?.id || "",
        trialPopupDay ?? 0,
      );
    }
    setTrialPopupDay(null);
  }, [
    isTrialPopupSimulationEnabled,
    markTrialPopupSeen,
    programTrackingSnapshot?.program?.id,
    trialPopupDay,
  ]);

  const getInternalMenuNumberForDay = useCallback((dayNumber) => {
    const safeDay = Number(dayNumber);
    if (!Number.isFinite(safeDay) || safeDay < 1) return 1;
    const totalMenus = allMenus.length || 1;
    return ((Math.floor(safeDay) - 1) % totalMenus) + 1;
  }, [allMenus.length]);

  const handleContinueFreeFromTrialPopup = useCallback(() => {
    const dayNumber = trialPopupDay ?? programTrackingSnapshot?.dayIndex ?? 1;
    const internalNumber = getInternalMenuNumberForDay(dayNumber);

    if (!isTrialPopupSimulationEnabled) {
      markTrialPopupSeen(
        programTrackingSnapshot?.program?.id || "",
        trialPopupDay ?? 0,
      );
    }

    setTrialPopupDay(null);
    setActiveView("dietas");
    setExploreInternalNumber(internalNumber);
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }, [
    getInternalMenuNumberForDay,
    isTrialPopupSimulationEnabled,
    markTrialPopupSeen,
    programTrackingSnapshot?.dayIndex,
    programTrackingSnapshot?.program?.id,
    trialPopupDay,
  ]);

  const handleGoPremiumFromTrialPopup = useCallback(() => {
    if (!isTrialPopupSimulationEnabled) {
      markTrialPopupSeen(
        programTrackingSnapshot?.program?.id || "",
        trialPopupDay ?? 0,
      );
    }
    setTrialPopupDay(null);
    handleOpenPremiumInfo();
  }, [
    handleOpenPremiumInfo,
    isTrialPopupSimulationEnabled,
    markTrialPopupSeen,
    programTrackingSnapshot?.program?.id,
    trialPopupDay,
  ]);

  const handleStartTrialPopupSimulation = useCallback(() => {
    setTrialPopupDay(null);
    setIsTrialPopupSimulationEnabled(true);
  }, []);

  useEffect(() => {
    if (!isTrialPopupSimulationEnabled) return undefined;

    let currentDay = TRIAL_POPUP_START_DAY;
    setTrialPopupDay(currentDay);

    const timerId = window.setInterval(() => {
      currentDay += 1;
      if (currentDay > TRIAL_POPUP_END_DAY) {
        window.clearInterval(timerId);
        setTrialPopupDay(null);
        setIsTrialPopupSimulationEnabled(false);
        return;
      }
      setTrialPopupDay(currentDay);
    }, trialPopupSimulationIntervalMs);

    return () => {
      window.clearInterval(timerId);
    };
  }, [isTrialPopupSimulationEnabled, trialPopupSimulationIntervalMs]);

  const handleGoToLinks = () => {
    setActiveView("links");
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const handleToggleNotices = () => {
    setNoticesEnabled((prev) => !prev);
  };

  const handleMarkNoticeRead = (noticeId) => {
    setDismissedNoticeIds((prev) =>
      prev.includes(noticeId) ? prev : [...prev, noticeId],
    );
  };

  const handleRestoreNotices = () => {
    setDismissedNoticeIds([]);
  };

  const handlePreferenceChange = (preferenceKey) => {
    setNoticePreferences((prev) => ({
      ...prev,
      [preferenceKey]: !prev[preferenceKey],
    }));
  };

  const handleSubmitConsult = async () => {
    const cleanText = consultDraft.trim();
    if (!cleanText) {
      setConsultFeedback(noticeCopy.consultEmpty);
      return;
    }

    setIsSubmittingConsult(true);

    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text: cleanText,
      createdAt: new Date().toISOString(),
      language: selectedLanguage,
      remoteStatus: "pending",
    };

    try {
      const remoteResult = await submitConsultToBackend({
        text: cleanText,
        language: selectedLanguage,
        dietCalories: selectedDietCalories,
        menuLabel: selectedMenuLabel,
        createdAt: entry.createdAt,
      });

      const remoteStatus = remoteResult.status === "sent" ? "sent" : "queued";
      const savedEntry = { ...entry, remoteStatus };
      setConsultHistory((prev) => [savedEntry, ...prev].slice(0, 40));
      setConsultDraft("");
      setConsultFeedback(
        remoteStatus === "sent"
          ? noticeCopy.consultSentRemote
          : noticeCopy.consultQueuedRemote,
      );
    } catch {
      const savedEntry = { ...entry, remoteStatus: "error" };
      setConsultHistory((prev) => [savedEntry, ...prev].slice(0, 40));
      setConsultDraft("");
      setConsultFeedback(noticeCopy.consultRemoteError);
    } finally {
      setIsSubmittingConsult(false);
    }
  };

  const handleOpenDataConsent = () => {
    setIsDataConsentOpen(true);
  };

  const handleCloseDataConsent = () => {
    setIsDataConsentOpen(false);
  };

  const handleContinueToPlaySubscription = () => {
    window.open(PLAY_SUBSCRIPTIONS_URL, "_blank", "noopener,noreferrer");
  };

  const handleRestorePremiumPlan = useCallback(async () => {
    if (!effectiveUserId) {
      setPremiumRestoreFeedback(
        premiumInfoCopy.restoreNoUser || "No linked user found to restore.",
      );
      return;
    }

    setIsRestoringPremium(true);
    setPremiumRestoreFeedback("");
    try {
      const result = await fetchUserPlanFromBackend(effectiveUserId);
      if (result.remote && result.plan === "premium") {
        setUserPlan("premium");
        setPremiumRestoreFeedback(
          premiumInfoCopy.restoreSuccess || "Premium restored successfully.",
        );
      } else if (result.remote) {
        setUserPlan("free");
        setPremiumRestoreFeedback(
          premiumInfoCopy.restoreNoPremium ||
            "No active Premium subscription was found for this user.",
        );
      } else {
        setPremiumRestoreFeedback(
          premiumInfoCopy.restoreError || "Could not restore Premium. Please try again.",
        );
      }
    } catch {
      setPremiumRestoreFeedback(
        premiumInfoCopy.restoreError || "Could not restore Premium. Please try again.",
      );
    } finally {
      setIsRestoringPremium(false);
    }
  }, [effectiveUserId, premiumInfoCopy]);

  const handleChangeStatsProfileField = (field, value) => {
    setStatsProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSetUserPlan = useCallback((nextPlan) => {
    setUserPlan(nextPlan === "premium" ? "premium" : "free");
  }, []);

  useEffect(() => {
    if (!premiumRestoreFeedback) return;

    const feedbackTimeoutId = window.setTimeout(() => {
      setPremiumRestoreFeedback("");
    }, 4500);

    return () => {
      window.clearTimeout(feedbackTimeoutId);
    };
  }, [premiumRestoreFeedback]);

  const handleSubmitDataConsent = useCallback(async () => {
    const normalizedAge = Number(String(statsProfile.age).replace(",", "."));
    const ageValue = Number.isFinite(normalizedAge) && normalizedAge > 0
      ? Math.round(normalizedAge)
      : null;
    const normalizedWeight = Number(String(imcWeight).replace(",", "."));
    const weightValue = Number.isFinite(normalizedWeight) && normalizedWeight > 0
      ? normalizedWeight
      : null;
    const normalizedHeight = Number(String(imcHeight).replace(",", "."));
    const heightValue = Number.isFinite(normalizedHeight) && normalizedHeight > 0
      ? normalizedHeight
      : null;
    const nowIso = new Date().toISOString();
    const trackedUser = programTrackingSnapshot?.user;
    const trackedProgram = programTrackingSnapshot?.program;
    const userId =
      trackedUser?.id ||
      (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
            const random = Math.floor(Math.random() * 16);
            const value = char === "x" ? random : ((random & 0x3) | 0x8);
            return value.toString(16);
          }));

    const payload = {
      id: userId,
      alias: statsProfile.alias.trim() || null,
      country: statsProfile.country.trim() || null,
      age: ageValue,
      gender: trackedUser?.gender || imcSex || "unknown",
      heightCm: trackedUser?.heightCm ?? heightValue,
      weightKg: trackedUser?.weightKg ?? weightValue,
      imc: trackedUser?.imc ?? imcValue,
      dietCalories: trackedProgram?.caloriesTarget ?? selectedDietCalories,
      noticesAccepted: noticesEnabled,
      trackingConsent: true,
      startDatetime: trackedUser?.startDatetime || nowIso,
      currentDatetime: nowIso,
    };

    setIsSubmittingDataConsent(true);
    try {
      await syncUserProfileToBackend(payload);
      setBackendUserId(userId);
      setStatsDataAuthorized(true);
      handleSetUserPlan("premium");
      setConsultFeedback(
        noticeCopy.dataConsentSaved ?? "Statistical data saved successfully.",
      );
      setIsDataConsentOpen(false);
    } catch {
      setConsultFeedback(
        noticeCopy.dataConsentFailed ?? "Could not send data. Please try again.",
      );
      void trackAnalyticsEvent("sync_error", {
        source: "user_profile",
        message: "data_consent_submit_failed",
      });
    } finally {
      setIsSubmittingDataConsent(false);
    }
  }, [
    handleSetUserPlan,
    imcHeight,
    imcSex,
    imcValue,
    imcWeight,
    noticeCopy.dataConsentFailed,
    noticeCopy.dataConsentSaved,
    noticesEnabled,
    programTrackingSnapshot?.program,
    programTrackingSnapshot?.user,
    selectedDietCalories,
    setBackendUserId,
    statsProfile.age,
    statsProfile.alias,
    statsProfile.country,
  ]);

  const handleClearConsultHistory = () => {
    setConsultHistory([]);
    setConsultFeedback("");
  };

  const handleEnablePush = async () => {
    const result = await requestPushPermission();
    setPushStatus(result.status);
  };

  const handleBackToTop = () => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const handleGoToMenuList = () => {
    if (import.meta.env.DEV && !isTrialPopupSimulationEnabled) {
      handleStartTrialPopupSimulation();
    }

    requestAnimationFrame(() => {
      if (!menuListSectionRef.current) return;
      menuListSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const handleOpenImc = () => {
    setImcInitialFlowStep("calc");
    setImcDirectCalories(null);
    setIsImcOpen(true);
  };

  const handleOpenCommitFromDiet = (calories) => {
    const safeCalories = availableDiets.includes(calories) ? calories : 1600;
    setImcInitialFlowStep("commit");
    setImcDirectCalories(safeCalories);
    setIsImcOpen(true);
  };

  const handleConsejoSelect = (event) => {
    const consejoId = Number(event.target.value);
    setSelectedConsejoId(consejoId);

    const selected = visibleConsejosList.find((consejo) => consejo.id === consejoId);
    if (!selected?.anchor) return;

    requestAnimationFrame(() => {
      const target = document.getElementById(selected.anchor);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleCloseImc = useCallback(() => {
    setIsImcOpen(false);
    setImcInitialFlowStep("calc");
    setImcDirectCalories(null);
  }, []);

  const handleSelectDiet = (calories) => {
    const fallbackCalories = 1600;
    if (!availableDiets.includes(calories)) {
      setSelectedDietCalories(fallbackCalories);
      setDietNotice(
        formatDietUnavailableMessage(
          uiText.dietUnavailable,
          calories,
          fallbackCalories,
        ),
      );
    } else {
      setSelectedDietCalories(calories);
      setDietNotice("");
    }
    setExploreInternalNumber(1);
    setActiveView("dietas");
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const handleConfirmImcStart = useCallback(
    ({ calories, offsetDays, profile }) => {
      const rawOffset = Number(offsetDays);
      const safeOffset = Number.isFinite(rawOffset)
        ? Math.max(0, Math.min(7, rawOffset))
        : 0;

      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      startDate.setDate(startDate.getDate() + safeOffset);

      const formattedStartDate = startDate.toLocaleDateString(
        selectedLanguage === "es" ? "es-ES" : selectedLanguage,
      );

      try {
        localStorage.setItem(PROGRAM_START_DATE_KEY, startDate.toISOString());
      } catch {
        // ignore storage errors
      }

      setProgramStartIso(startDate.toISOString());
      void trackAnalyticsEvent("imc_completed", {
        language: selectedLanguage,
        calories,
        offsetDays: safeOffset,
        imcValue: profile?.imc ?? imcValue ?? null,
      });
      void trackAnalyticsEvent("program_started", {
        language: selectedLanguage,
        calories,
        startDateIso: startDate.toISOString(),
        offsetDays: safeOffset,
      });
      if (profile) {
        setStatsProfile((prev) => ({
          ...prev,
          alias: profile.alias || "",
          country: profile.country || "",
          age: profile.age == null ? "" : String(profile.age),
        }));
      }

      const trackingProfile = {
        alias: profile?.alias || "",
        country: profile?.country || "",
        age: profile?.age ?? null,
        gender: profile?.gender || imcSex || "unknown",
        heightCm: profile?.heightCm ?? null,
        weightKg: profile?.weightKg ?? null,
        imc: profile?.imc ?? imcValue ?? null,
      };

      const trackingRecord = createProgramStartRecord({
        profile: trackingProfile,
        dietLevel: calories,
        startDateIso: startDate.toISOString(),
        startDateTimeIso: startDate.toISOString(),
        plannedDays: 56,
      });
      setProgramTrackingSnapshot({
        user: trackingRecord.user,
        program: trackingRecord.program,
        dayIndex: 0,
        daysRemaining: 56,
      });
      setBackendUserId(trackingRecord.user.id);
      void syncProgramStartToBackend({
        user: trackingRecord.user,
        program: trackingRecord.program,
      }).catch((error) => {
        // Keep working in local mode if sync fails, but log details for diagnosis.
        // eslint-disable-next-line no-console
        console.warn("Program start sync failed", error);
        void trackAnalyticsEvent("sync_error", {
          source: "program_start",
          message: String(error?.message || error || "unknown"),
        });
        // Keep working in local mode if sync fails.
      });
      setPendingMorningCheckin(getPendingMorningCheckin());
      handleSelectDiet(calories);
      if (safeOffset > 0) {
        setDietNotice(`${uiText.imcStartSaved} (${formattedStartDate})`);
      }
    },
    [handleSelectDiet, imcSex, imcValue, selectedLanguage, uiText.imcStartSaved],
  );

  const handleMorningMilestoneChange = (mealKey, value) => {
    setMorningMilestones((prev) => ({
      ...prev,
      [mealKey]: value,
    }));
  };

  const handleSkipMorningCheckin = () => {
    setPendingMorningCheckin(null);
  };

  const handleSaveMorningCheckin = () => {
    if (!pendingMorningCheckin) return;

    const record = saveMorningCheckin({
      programId: pendingMorningCheckin.programId,
      trackingDateIso: pendingMorningCheckin.trackingDateIso,
      dayNumber: pendingMorningCheckin.dayNumber,
      milestones: morningMilestones,
      notes: morningNotes.trim(),
      caloriesTarget: pendingMorningCheckin.caloriesTarget,
    });
    void syncDailyCheckinToBackend(record).catch((error) => {
      // Keep local tracking if backend is offline, but log details for diagnosis.
      // eslint-disable-next-line no-console
      console.warn("Daily check-in sync failed", error);
      void trackAnalyticsEvent("sync_error", {
        source: "daily_checkin",
        message: String(error?.message || error || "unknown"),
      });
      // Keep local tracking if backend is offline.
    });

    void trackAnalyticsEvent("day_checkin_saved", {
      programId: record.programId,
      dayNumber: record.dayNumber,
      trackingDateIso: record.trackingDateIso,
      caloriesSaved: record.caloriesSaved,
      caloriesExtra: record.caloriesExtra,
    });

    setLatestMorningSummary(record);
    setMorningNotes("");
    setMorningMilestones({
      breakfast: false,
      lunch: false,
      meal: false,
      snack: false,
      dinner: false,
    });
    setPendingMorningCheckin(null);
    setProgramTrackingSnapshot(getLatestProgramSnapshot());
  };

  const handleSelectLanguage = (language) => {
    setSelectedLanguage(language);
    try {
      localStorage.setItem(LANGUAGE_KEY, language);
    } catch {
      // ignore storage errors
    }
  };

  useEffect(() => {
    const trackedUserId = programTrackingSnapshot?.user?.id;
    if (!trackedUserId || trackedUserId === backendUserId) return;
    setBackendUserId(trackedUserId);
  }, [backendUserId, programTrackingSnapshot?.user?.id]);

  useEffect(() => {
    if (!backendUserId) return;
    try {
      localStorage.setItem(USER_ID_KEY, backendUserId);
    } catch {
      // ignore storage errors
    }
  }, [backendUserId]);

  useEffect(() => {
    try {
      localStorage.setItem(USER_PLAN_KEY, userPlan);
    } catch {
      // ignore storage errors
    }
  }, [userPlan]);

  useEffect(() => {
    if (!effectiveUserId) return;
    if (lastPlanHydratedUserIdRef.current === effectiveUserId) return;

    let active = true;
    fetchUserPlanFromBackend(effectiveUserId)
      .then((result) => {
        if (!active) return;
        if (result.remote && result.plan) {
          setUserPlan(result.plan === "premium" ? "premium" : "free");
        }
        lastPlanHydratedUserIdRef.current = effectiveUserId;
      })
      .catch(() => {
        if (!active) return;
        lastPlanHydratedUserIdRef.current = effectiveUserId;
      });

    return () => {
      active = false;
    };
  }, [effectiveUserId]);

  useEffect(() => {
    if (!effectiveUserId) return;
    if (lastPlanHydratedUserIdRef.current !== effectiveUserId) return;

    const syncKey = `${effectiveUserId}:${userPlan}`;
    if (lastPlanSyncedRef.current === syncKey) return;

    syncUserPlanToBackend({ userId: effectiveUserId, plan: userPlan })
      .then(() => {
        lastPlanSyncedRef.current = syncKey;
      })
      .catch(() => {
        // Keep local plan if backend update fails.
      });
  }, [effectiveUserId, userPlan]);

  useEffect(() => {
    if (!visibleConsejosList.length) return;
    const selectedIsVisible = visibleConsejosList.some(
      (consejo) => consejo.id === selectedConsejoId,
    );
    if (!selectedIsVisible) {
      setSelectedConsejoId(visibleConsejosList[0].id);
    }
  }, [selectedConsejoId, visibleConsejosList]);

  useEffect(() => {
    void trackAnalyticsEvent("app_open", {
      language: selectedLanguage,
      isNative: Boolean(window?.Capacitor?.isNativePlatform?.()),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 200);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [activeView]);

  useEffect(() => {
    try {
      localStorage.setItem(NOTICES_ENABLED_KEY, String(noticesEnabled));
    } catch {
      // ignore storage errors
    }
  }, [noticesEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem(
        NOTICES_DISMISSED_KEY,
        JSON.stringify(dismissedNoticeIds),
      );
    } catch {
      // ignore storage errors
    }
  }, [dismissedNoticeIds]);

  useEffect(() => {
    try {
      localStorage.setItem(
        NOTICE_PREFERENCES_KEY,
        JSON.stringify(noticePreferences),
      );
    } catch {
      // ignore storage errors
    }
  }, [noticePreferences]);

  useEffect(() => {
    try {
      localStorage.setItem(CONSULT_HISTORY_KEY, JSON.stringify(consultHistory));
    } catch {
      // ignore storage errors
    }
  }, [consultHistory]);

  useEffect(() => {
    try {
      localStorage.setItem(STATS_DATA_AUTH_KEY, String(statsDataAuthorized));
    } catch {
      // ignore storage errors
    }
  }, [statsDataAuthorized]);

  useEffect(() => {
    try {
      localStorage.setItem(STATS_PROFILE_KEY, JSON.stringify(statsProfile));
    } catch {
      // ignore storage errors
    }
  }, [statsProfile]);

  useEffect(() => {
    let mounted = true;
    initializePushNotifications().then((result) => {
      if (!mounted) return;
      setPushStatus(result.status);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const snapshot = getLatestProgramSnapshot();
    setProgramTrackingSnapshot(snapshot);

    const pending = getPendingMorningCheckin();
    setPendingMorningCheckin(pending);

    if (snapshot?.program?.id) {
      const latest = getLatestDailyTracking(snapshot.program.id);
      setLatestMorningSummary(latest);
    }
  }, [programStartIso]);

  useEffect(() => {
    if (isTrialPopupSimulationEnabled) return;

    if (isPremiumUser) {
      setTrialPopupDay(null);
      return;
    }

    if (isImcOpen || isDataConsentOpen || pendingMorningCheckin) {
      return;
    }

    const programId = programTrackingSnapshot?.program?.id || "";
    const dayIndex = programTrackingSnapshot?.dayIndex ?? 0;
    if (!programId) return;
    if (dayIndex < TRIAL_POPUP_START_DAY || dayIndex > TRIAL_POPUP_END_DAY) return;

    const lastSeenDay = getLastSeenTrialPopupDay(programId);
    if (dayIndex <= lastSeenDay) return;
    setTrialPopupDay(dayIndex);
  }, [
    getLastSeenTrialPopupDay,
    isDataConsentOpen,
    isImcOpen,
    isPremiumUser,
    isTrialPopupSimulationEnabled,
    pendingMorningCheckin,
    programTrackingSnapshot?.dayIndex,
    programTrackingSnapshot?.program?.id,
  ]);

  const trialPopupOrdinal = useMemo(() => {
    if (!Number.isFinite(trialPopupDay)) return "";
    if (selectedLanguage === "es") {
      return TRIAL_DAY_ORDINALS_ES[trialPopupDay] ?? String(trialPopupDay);
    }
    return String(trialPopupDay);
  }, [selectedLanguage, trialPopupDay]);

  const trialPopupTitle = useMemo(() => {
    const rawTitle = uiText.secondDayPopupTitle || "";
    if (!rawTitle.includes("{ordinal}")) return rawTitle;
    return rawTitle.replace("{ordinal}", trialPopupOrdinal || "");
  }, [trialPopupOrdinal, uiText.secondDayPopupTitle]);

  const trialPopupBody = useMemo(() => {
    const base = uiText.secondDayPopupBody || "";
    if (trialPopupDay !== TRIAL_POPUP_END_DAY) return base;
    const finalLine = uiText.secondDayPopupFinalBody || "";
    return finalLine ? `${base} ${finalLine}` : base;
  }, [trialPopupDay, uiText.secondDayPopupBody, uiText.secondDayPopupFinalBody]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let isDisposed = false;
    let listenerHandle = null;

    const registerBackButton = async () => {
      try {
        const handle = await CapacitorApp.addListener("backButton", () => {
          if (trialPopupDay != null) {
            handleCloseTrialPopup();
            return;
          }

          if (isDataConsentOpen) {
            setIsDataConsentOpen(false);
            return;
          }

          if (isImcOpen) {
            handleCloseImc();
            return;
          }

          if (pendingMorningCheckin) {
            setPendingMorningCheckin(null);
            return;
          }

          if (!showPortada) {
            if (activeView !== "home") {
              setActiveView("home");
              requestAnimationFrame(() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
              });
              return;
            }

            setShowPortada(true);
            return;
          }

          CapacitorApp.exitApp();
        });

        if (!isDisposed) {
          listenerHandle = handle;
        } else if (handle?.remove) {
          await handle.remove();
        }
      } catch {
        // If native back listener registration fails, keep default system behavior.
      }
    };

    void registerBackButton();

    return () => {
      isDisposed = true;
      if (listenerHandle?.remove) {
        void listenerHandle.remove();
      }
    };
  }, [
    activeView,
    handleCloseTrialPopup,
    handleCloseImc,
    isDataConsentOpen,
    isImcOpen,
    pendingMorningCheckin,
    showPortada,
    trialPopupDay,
  ]);

  return (
    showPortada ? (
      <div className="cover-screen">
        <div className="cover-overlay">
          <FoodBurstScene className="cover-background-effect" />

          <header className="cover-top-brand" aria-label={uiText.coverAriaLabel}>
            <img src={logoDieta} alt={uiText.logoAlt} className="cover-top-logo" />
            <img src={rotulo} alt="Dieta App" className="cover-top-rotulo" />
            <p className="cover-bottom-message">{uiText.coverBottomMessage}</p>
          </header>

          <main className="cover-center">
            <div className="cover-message">
              <p className="cover-center-text" aria-label={coverBalloonAriaLabel}>
                {coverBalloonLines.map((line, index) =>
                  line.trim() ? (
                    <span
                      className="cover-text-line"
                      key={`${selectedLanguage}-${index}`}
                      style={{ "--line-delay": `${index * 0.22}s` }}
                    >
                      <span className="cover-text-layer cover-text-bold">{line}</span>
                      <span
                        className="cover-text-layer cover-text-light"
                        aria-hidden="true"
                      >
                        {line}
                      </span>
                    </span>
                  ) : (
                    <span className="cover-text-gap" aria-hidden="true" key={`${selectedLanguage}-${index}`}>
                      &nbsp;
                    </span>
                  ),
                )}
              </p>
            </div>
          </main>

          <button
            type="button"
            className="cover-arrow-button"
            onClick={handleEnterFromPortada}
            aria-label={uiText.coverEnter}
          >
            <img
              src={coverArrowImage}
              alt={uiText.coverEnter}
              className="cover-arrow-image"
            />
          </button>
        </div>
      </div>
    ) : (
    <div className="app">
      <header className="app-opening-header">
        <div className="opening-brand">
          <button
            type="button"
            className="opening-brand-reset"
            onClick={handleBackToPortada}
            aria-label={uiText.backToCover}
          >
            <img
              src={logoDieta}
              alt={uiText.logoAlt}
              className="opening-logo"
            />
          </button>
          <div className="opening-rotulo-wrap">
            <button
              type="button"
              className="opening-brand-reset"
              onClick={handleBackToPortada}
              aria-label={uiText.backToCover}
            >
              <img src={rotulo} alt="Dieta App" className="opening-rotulo" />
            </button>
          </div>
        </div>

        <nav className="opening-links" aria-label={uiText.navSections}>
          <button
            className={`opening-link-btn opening-link-btn-menu ${
              activeView === "dietas" ? "is-active" : ""
            }`}
            onClick={handleGoToDietas}
            aria-label={uiText.goDiets}
          >
            <span className="opening-link-text">{uiText.navDietLabel}</span>
          </button>
          <button
            className={`opening-link-btn ${
              activeView === "tips" ? "is-active" : ""
            }`}
            onClick={handleGoToConsejos}
            aria-label={uiText.goTips}
          >
            <span className="opening-link-text">{uiText.navTipsLabel}</span>
          </button>
          <button
            className={`opening-link-btn ${
              activeView === "idiomas" ? "is-active" : ""
            }`}
            onClick={handleGoToIdiomas}
            aria-label={uiText.goLanguages}
          >
            <span className="opening-link-text">{uiText.navLanguageLabel}</span>
          </button>
          <button
            className={`opening-link-btn ${
              activeView === "links" ? "is-active" : ""
            }`}
            onClick={handleGoToLinks}
            aria-label={uiText.goLinks}
          >
            <span className="opening-link-text">{uiText.navLinksLabel}</span>
            {unreadBadgeCount > 0 ? (
              <span className="opening-link-badge" aria-label={noticeCopy.unreadLabel}>
                {unreadBadgeCount}
              </span>
            ) : null}
          </button>
        </nav>
      </header>

      {activeView === "home" ? (
        <section className="panel opening-bottom-panel">
          <div className="panel-header">
            <h2>{uiText.nutritionInfo}</h2>
            <p className="opening-copy">{uiText.intro1}</p>
            <button className="opening-imc-trigger" onClick={handleOpenImc}>
              {uiText.measureImc}
            </button>
            {import.meta.env.DEV ? (
              <button
                className="menu-nav-button menu-nav-button-slim"
                onClick={handleStartTrialPopupSimulation}
                disabled={isTrialPopupSimulationEnabled}
                type="button"
              >
                {isTrialPopupSimulationEnabled
                  ? "Simulacro semana en curso"
                  : "Iniciar simulacro semana"}
              </button>
            ) : null}
            <p className="opening-copy">{uiText.intro2}</p>
            <p className="opening-program-cta">{uiText.chooseProgram}</p>
            {programStartLabel ? (
              <p className="program-start-note">{programStartLabel}</p>
            ) : null}
            {programTrackingSnapshot?.program ? (
              <p className="program-day-note">
                {uiText.programProgress56
                  .replace("{current}", String(Math.min(56, Math.max(0, programTrackingSnapshot.dayIndex))))
                  .replace("{total}", "56")}
              </p>
            ) : null}
            {latestMorningSummary ? (
              <p className="menu-note">
                {uiText.morningCaloriesTotal}: {latestMorningSummary.totalCalories} kcal · {uiText.morningCaloriesSaved}: {latestMorningSummary.caloriesSaved} kcal
              </p>
            ) : null}

            <div className="imc-tables">
              <div className="imc-table-card">
                <h3>{uiText.woman}</h3>
                <table className="imc-table">
                  <thead>
                    <tr>
                      <th>IMC</th>
                      <th>{uiText.category}</th>
                      <th>{uiText.diet}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>&lt; 18</td>
                      <td>{uiText.underweight}</td>
                      <td>
                        <button
                          className="diet-link"
                          onClick={() => handleOpenCommitFromDiet(2000)}
                        >
                          2000
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td>18 - 25</td>
                      <td>{uiText.normalWeight}</td>
                      <td>
                        <button
                          className="diet-link"
                          onClick={() => handleOpenCommitFromDiet(1800)}
                        >
                          1800
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td>25 - 30</td>
                      <td>{uiText.overweight}</td>
                      <td>
                        <button
                          className="diet-link"
                          onClick={() => handleOpenCommitFromDiet(1600)}
                        >
                          1600
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td>&gt; 30</td>
                      <td>{uiText.obesity}</td>
                      <td>
                        <button
                          className="diet-link"
                          onClick={() => handleOpenCommitFromDiet(1400)}
                        >
                          1400
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="imc-table-card">
                <h3>{uiText.man}</h3>
                <table className="imc-table">
                  <thead>
                    <tr>
                      <th>IMC</th>
                      <th>{uiText.category}</th>
                      <th>{uiText.diet}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>&lt; 18</td>
                      <td>{uiText.underweight}</td>
                      <td>
                        <button
                          className="diet-link"
                          onClick={() => handleOpenCommitFromDiet(2000)}
                        >
                          2000
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td>18 - 25</td>
                      <td>{uiText.normalWeight}</td>
                      <td>
                        <button
                          className="diet-link"
                          onClick={() => handleOpenCommitFromDiet(2000)}
                        >
                          2000
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td>25 - 30</td>
                      <td>{uiText.overWeightSpaced}</td>
                      <td>
                        <button
                          className="diet-link"
                          onClick={() => handleOpenCommitFromDiet(1800)}
                        >
                          1800
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td>&gt; 30</td>
                      <td>{uiText.obesity}</td>
                      <td>
                        <button
                          className="diet-link"
                          onClick={() => handleOpenCommitFromDiet(1600)}
                        >
                          1600
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      ) : activeView === "tips" ? (
        <>
          <section className="panel">
            <div className="panel-header">
              <h2 className="tips-title">{locale.words.tipsTitle}</h2>
              <button className="menu-nav-button" onClick={handleBackToHome}>
                {locale.words.backHome}
              </button>
            </div>

            <div className="advice-controls">
              <label htmlFor="consejo-select" className="advice-label">
                {locale.words.tipsMenu}
              </label>
              <select
                id="consejo-select"
                className="advice-select"
                value={selectedConsejoId}
                onChange={handleConsejoSelect}
              >
                {visibleConsejosList.map((consejo) => (
                  <option key={consejo.id} value={consejo.id}>
                    {consejo.title}
                  </option>
                ))}
              </select>
              {!isPremiumUser && premiumConsejoCount > 0 ? (
                <>
                  <p className="menu-note">
                    {selectedLanguage === "es"
                      ? `${premiumConsejoCount} consejos avanzados disponibles en Premium.`
                      : selectedLanguage === "en"
                        ? `${premiumConsejoCount} advanced tips are available in Premium.`
                        : selectedLanguage === "fr"
                          ? `${premiumConsejoCount} conseils avances sont disponibles en Premium.`
                          : `${premiumConsejoCount} erweiterte Tipps sind in Premium verfugbar.`}
                  </p>
                  <button className="menu-nav-button" onClick={handleOpenPremiumInfo}>
                    {selectedLanguage === "es"
                      ? "Ver Premium"
                      : selectedLanguage === "en"
                        ? "See Premium"
                        : selectedLanguage === "fr"
                          ? "Voir Premium"
                          : "Premium ansehen"}
                  </button>
                </>
              ) : null}
            </div>
          </section>

          <section className="panel advice-list-panel">
            {selectedConsejo ? (
              <article
                key={selectedConsejo.id}
                id={selectedConsejo.anchor}
                className="advice-item is-active"
              >
                <h3>{selectedConsejo.title}</h3>
                <div className="advice-text">
                  {renderAdviceText(selectedConsejo.text)}
                </div>
                <div className="advice-meta">
                  {selectedConsejo.source ? (
                    <p>
                      <strong>{adviceMetaCopy.sourceLabel}:</strong> {selectedConsejo.source}
                    </p>
                  ) : null}
                  {selectedConsejo.sourceUrl ? (
                    <p>
                      <a
                        className="advice-source-link"
                        href={selectedConsejo.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {adviceMetaCopy.openSource}
                      </a>
                    </p>
                  ) : null}
                  {selectedConsejo.reviewedAt ? (
                    <p>
                      <strong>{adviceMetaCopy.reviewLabel}:</strong>{" "}
                      {formatAdviceReviewDate(selectedConsejo.reviewedAt)}
                    </p>
                  ) : null}
                </div>
              </article>
            ) : null}
          </section>
        </>
      ) : activeView === "idiomas" ? (
        <section className="panel">
          <div className="panel-header">
            <h2>{locale.words.languages}</h2>
            <p className="menu-note">{locale.words.chooseLanguage}</p>
            <div className="diet-picker">
              <button
                className={`diet-pill ${
                  selectedLanguage === "es" ? "is-active" : ""
                }`}
                onClick={() => handleSelectLanguage("es")}
              >
                Español
              </button>
              <button
                className={`diet-pill ${
                  selectedLanguage === "en" ? "is-active" : ""
                }`}
                onClick={() => handleSelectLanguage("en")}
              >
                English
              </button>
              <button
                className={`diet-pill ${
                  selectedLanguage === "fr" ? "is-active" : ""
                }`}
                onClick={() => handleSelectLanguage("fr")}
              >
                Français
              </button>
              <button
                className={`diet-pill ${
                  selectedLanguage === "de" ? "is-active" : ""
                }`}
                onClick={() => handleSelectLanguage("de")}
              >
                Deutsch
              </button>
            </div>
            <button className="menu-nav-button" onClick={handleBackToHome}>
              {locale.words.backHome}
            </button>
          </div>
        </section>
      ) : activeView === "links" ? (
        isPremiumUser ? (
        <>
          <section className="panel">
            <div className="panel-header">
              <h2>{noticeCopy.title}</h2>
              <p className="menu-note">{noticeCopy.intro}</p>
              {premiumRestoreFeedback ? (
                <p className="menu-note">{premiumRestoreFeedback}</p>
              ) : null}

              <label className="notice-toggle" htmlFor="notices-toggle">
                <input
                  id="notices-toggle"
                  type="checkbox"
                  checked={noticesEnabled}
                  onChange={handleToggleNotices}
                />
                <span>{noticeCopy.enableToggle ?? "Enable alerts and messages"}</span>
              </label>

              <p className="menu-note">
                {noticeCopy.unreadLabel}: {unreadNotices.length}
              </p>

              <p className="menu-note notice-data-consent-text">
                {statsDataAuthorized
                  ? (noticeCopy.dataConsentDone ?? "Statistical data sharing authorized.")
                  : (noticeCopy.dataConsentLead ?? "If data sharing is not authorized yet, you can do it here.")}
                {!statsDataAuthorized ? (
                  <button
                    type="button"
                    className="notice-link-button"
                    onClick={handleOpenDataConsent}
                  >
                    {noticeCopy.dataConsentLink ?? "Authorize now"}
                  </button>
                ) : null}
              </p>

              <button className="menu-nav-button" onClick={handleRestoreNotices}>
                {noticeCopy.resetRead}
              </button>
              <button className="menu-nav-button" onClick={handleBackToHome}>
                {locale.words.backHome}
              </button>
            </div>
          </section>

          <section className="panel notice-list-panel">
            {noticesEnabled ? (
              unreadNotices.length > 0 ? (
                unreadNotices.map((notice) => (
                  <article key={notice.id} className={`notice-item notice-${notice.type}`}>
                    <div className="notice-item-header">
                      <h3>{notice.title}</h3>
                      <span className="notice-tag">
                        {notice.type === "reminder"
                          ? (noticeCopy.typeReminder ?? "Recordatorio")
                          : notice.type === "message"
                            ? (noticeCopy.typeMessage ?? "Mensaje")
                            : noticeCopy.typeInfo}
                      </span>
                    </div>
                    <p>{notice.body}</p>
                    <button
                      className="menu-nav-button menu-nav-button-slim"
                      onClick={() => handleMarkNoticeRead(notice.id)}
                    >
                      {noticeCopy.markRead}
                    </button>
                  </article>
                ))
              ) : (
                <article className="notice-item notice-empty">
                  <h3>{noticeCopy.allRead}</h3>
                </article>
              )
            ) : (
              <article className="notice-item notice-empty">
                <h3>{noticeCopy.notificationsOff}</h3>
              </article>
            )}
          </section>

          <section className="panel faq-panel">
            <div className="panel-header">
              <h2>{noticeCopy.faqTitle}</h2>
              <p className="menu-note">{noticeCopy.faqIntro}</p>
            </div>

            <div className="faq-list">
              {noticeCopy.faq.map((item, index) => (
                <details key={`${item.question}-${index}`} className="faq-item">
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="panel consult-panel">
            <div className="panel-header">
              <h2>{noticeCopy.consultTitle}</h2>
              <p className="menu-note">{noticeCopy.consultIntro}</p>
              <p className="menu-note">
                {noticeCopy.consultRoutingInfo ?? "Questions are sent by POST to VITE_API_BASE_URL/consults when backend is configured. Otherwise they are stored locally."}
              </p>
            </div>

            <div className="consult-form">
              <textarea
                className="consult-textarea"
                value={consultDraft}
                disabled={isSubmittingConsult}
                onChange={(event) => {
                  setConsultDraft(event.target.value);
                  if (consultFeedback) setConsultFeedback("");
                }}
                placeholder={noticeCopy.consultPlaceholder}
                rows={4}
              />

              {consultFeedback ? (
                <p className="consult-feedback">{consultFeedback}</p>
              ) : null}

              <button
                className="menu-nav-button"
                onClick={handleSubmitConsult}
                disabled={isSubmittingConsult}
                aria-busy={isSubmittingConsult}
              >
                {isSubmittingConsult
                  ? `${noticeCopy.consultSubmit}...`
                  : noticeCopy.consultSubmit}
              </button>
            </div>

            <div className="consult-history">
              <div className="consult-history-head">
                <h3>{noticeCopy.consultHistoryTitle}</h3>
                <button
                  className="menu-nav-button menu-nav-button-slim"
                  onClick={handleClearConsultHistory}
                >
                  {noticeCopy.consultClear}
                </button>
              </div>

              {consultHistory.length ? (
                <ul className="consult-history-list">
                  {consultHistory.map((entry) => (
                    <li key={entry.id} className="consult-history-item">
                      <p>{entry.text}</p>
                      <small>
                        {new Date(entry.createdAt).toLocaleString(
                          selectedLanguage === "es" ? "es-ES" : selectedLanguage,
                        )}
                      </small>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="menu-note">{noticeCopy.consultHistoryEmpty}</p>
              )}
            </div>
          </section>
        </>
        ) : (
          <section className="panel premium-info-panel">
            <div className="panel-header">
              <h2>{premiumInfoCopy.title}</h2>
              <p className="menu-note">{premiumInfoCopy.intro}</p>
            </div>

            <article className="premium-info-card premium-offer-card">
              <h3>{premiumInfoCopy.offerTitle}</h3>
              <button
                className="menu-nav-button premium-link-btn"
                type="button"
                onClick={handleOpenDataConsent}
              >
                {premiumInfoCopy.offerPrimaryCta}
              </button>
              <button
                className="menu-nav-button premium-link-btn"
                type="button"
                onClick={handleRestorePremiumPlan}
                disabled={isRestoringPremium}
              >
                {isRestoringPremium
                  ? premiumInfoCopy.restoringCta
                  : premiumInfoCopy.restoreCta}
              </button>
              {premiumRestoreFeedback ? (
                <p className="menu-note">{premiumRestoreFeedback}</p>
              ) : null}
              <p className="premium-offer-legal">{premiumInfoCopy.offerLegal}</p>
              <p className="premium-offer-channel">{premiumInfoCopy.offerChannel}</p>
            </article>

            <article className="premium-info-card">
              <h3>{premiumInfoCopy.featuresTitle}</h3>
              <ul className="premium-feature-list">
                {premiumInfoCopy.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </article>

            <article className="premium-info-card">
              <h3>{premiumInfoCopy.linksTitle}</h3>
              <div className="premium-link-list">
                {premiumInfoCopy.links.map((linkItem) => (
                  <a
                    key={linkItem.href}
                    className="menu-nav-button premium-link-btn"
                    href={linkItem.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {linkItem.label}
                  </a>
                ))}
              </div>
            </article>

            <button className="menu-nav-button" onClick={handleBackToHome}>
              {premiumInfoCopy.continueCta}
            </button>
          </section>
        )
      ) : activeView === "dietas" ? (
        <>
          <section className="panel">
            <div className="panel-header">
              <h2>{locale.words.dietsProgram}</h2>
              <div className="diet-picker">
                <button
                  className={`diet-pill ${
                    selectedDietCalories === 1400 ? "is-active" : ""
                  }`}
                  onClick={() => handleSelectDiet(1400)}
                >
                  1400 kcal
                </button>
                <button
                  className={`diet-pill ${
                    selectedDietCalories === 1600 ? "is-active" : ""
                  }`}
                  onClick={() => handleSelectDiet(1600)}
                >
                  1600 kcal
                </button>
                <button
                  className={`diet-pill ${
                    selectedDietCalories === 1800 ? "is-active" : ""
                  }`}
                  onClick={() => handleSelectDiet(1800)}
                >
                  1800 kcal
                </button>
                <button
                  className={`diet-pill ${
                    selectedDietCalories === 2000 ? "is-active" : ""
                  }`}
                  onClick={() => handleSelectDiet(2000)}
                >
                  2000 kcal
                </button>
              </div>
              {dietNotice ? <p className="menu-note">{dietNotice}</p> : null}
              {programStartLabel ? (
                <p className="program-start-note">{programStartLabel}</p>
              ) : null}
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <button
                className="menu-nav-button menu-nav-button-slim"
                onClick={handleGoToMenuList}
              >
                {locale.words.viewAllMenus}
              </button>
              <h2>
                {menuHeaderTitle} · {formattedDate}
              </h2>
              {programDayLabel ? (
                <p className="program-day-note">{programDayLabel}</p>
              ) : null}
              <p className="menu-note">
                {getMenuLabel(exploreSelection, selectedLanguage)} · #
                {exploreSelection?.internalNumber} · {selectedDietCalories} kcal
              </p>
            </div>
            <MealCardsGrid
              mealOrder={mealOrder}
              menuByMeal={menuByMeal}
              locale={locale}
              formatMenuItem={formatMenuItem}
            />
          </section>

          <section className="panel" ref={menuListSectionRef}>
            <div className="panel-header">
              <h2>
                {locale.words.menuList} · {selectedDietCalories} kcal
              </h2>
              <p className="menu-note">{locale.words.exploreHint}</p>
              <button className="menu-nav-button" onClick={handleBackToHome}>
                {locale.words.backHome}
              </button>
            </div>
            <div className="explore-list">
              {allMenus.map((menu) => (
                <button
                  key={menu.internalNumber}
                  className={`explore-item ${
                    menu.internalNumber === exploreSelection?.internalNumber
                      ? "is-selected"
                      : ""
                  }`}
                  onClick={() => handleExploreSelect(menu.internalNumber)}
                >
                  {getMenuLabel(menu, selectedLanguage)} · #
                  {menu.internalNumber}
                </button>
              ))}
            </div>
          </section>

          <section className="panel" ref={previewSectionRef}>
            <div className="panel-header">
              <h2>
                {locale.words.preview} · {selectedMenuLabel}
              </h2>
            </div>
            <MealCardsGrid
              mealOrder={mealOrder}
              menuByMeal={menuByMeal}
              locale={locale}
              formatMenuItem={formatMenuItem}
            />
          </section>
        </>
      ) : (
        <section className="panel">
          <div className="panel-header">
            <h2>{locale.words.sectionUnavailable}</h2>
            <button className="menu-nav-button" onClick={handleBackToHome}>
              {locale.words.backHome}
            </button>
          </div>
        </section>
      )}

      {(activeView === "dietas" || activeView === "tips") && showBackToTop && (
        <button
          className="explore-back-floating"
          onClick={handleBackToTop}
          aria-label={locale.words.backToTop}
          title={locale.words.backToTop}
        >
          ↑
        </button>
      )}

      {trialPopupDay != null ? (
        <div
          className="imc-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={trialPopupTitle}
          onClick={handleCloseTrialPopup}
        >
          <section
            className="imc-modal second-day-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <h3>{trialPopupTitle}</h3>
            <p className="imc-flow-message">{trialPopupBody}</p>
            <button className="menu-nav-button" onClick={handleContinueFreeFromTrialPopup}>
              {uiText.secondDayPopupContinueFree}
            </button>
            <button
              className="menu-nav-button menu-nav-button-slim"
              onClick={handleGoPremiumFromTrialPopup}
            >
              {uiText.secondDayPopupGoPremium}
            </button>
          </section>
        </div>
      ) : null}

      {pendingMorningCheckin ? (
        <div className="imc-overlay" role="dialog" aria-modal="true" aria-label={uiText.morningCheckTitle}>
          <section className="imc-modal morning-check-modal" onClick={(event) => event.stopPropagation()}>
            <h3>{uiText.morningCheckTitle}</h3>
            <p className="imc-flow-message">{uiText.morningCheckBody}</p>

            <div className="morning-check-grid">
              {[
                ["breakfast", uiText.morningMealBreakfast],
                ["lunch", uiText.morningMealLunch],
                ["meal", uiText.morningMealMeal],
                ["snack", uiText.morningMealSnack],
                ["dinner", uiText.morningMealDinner],
              ].map(([mealKey, label]) => (
                <fieldset key={mealKey} className="morning-check-fieldset">
                  <legend>{label}</legend>
                  <label>
                    <input
                      type="radio"
                      name={`milestone-${mealKey}`}
                      checked={morningMilestones[mealKey] === true}
                      onChange={() => handleMorningMilestoneChange(mealKey, true)}
                    />
                    {uiText.morningYes}
                  </label>
                  <label>
                    <input
                      type="radio"
                      name={`milestone-${mealKey}`}
                      checked={morningMilestones[mealKey] === false}
                      onChange={() => handleMorningMilestoneChange(mealKey, false)}
                    />
                    {uiText.morningNo}
                  </label>
                </fieldset>
              ))}
            </div>

            <label className="imc-field" htmlFor="morning-notes">
              {uiText.morningNotesLabel}
              <textarea
                id="morning-notes"
                rows={3}
                value={morningNotes}
                onChange={(event) => setMorningNotes(event.target.value)}
                placeholder={uiText.morningNotesPlaceholder}
              />
            </label>

            <div className="morning-check-actions">
              <button className="menu-nav-button" onClick={handleSaveMorningCheckin}>
                {uiText.morningSave}
              </button>
              <button className="menu-nav-button" onClick={handleSkipMorningCheckin}>
                {uiText.morningSkip}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {isDataConsentOpen ? (
        <div className="imc-overlay data-consent-overlay" role="dialog" aria-modal="true" aria-label={premiumSignupFlowCopy.title}>
          <section className="imc-modal data-consent-modal-fullscreen" onClick={(event) => event.stopPropagation()}>
            <h3>{premiumSignupFlowCopy.title}</h3>
            <p className="data-consent-step-label">{premiumSignupFlowCopy.step1}</p>
            <p className="imc-flow-message">
              {noticeCopy.dataConsentBody ?? "Introduce alias, pais y edad para enviar datos estadisticos anonimos."}
            </p>

            <label className="imc-field" htmlFor="stats-alias">
              {uiText.imcCommitTrackingAliasLabel}
              <input
                id="stats-alias"
                type="text"
                value={statsProfile.alias}
                onChange={(event) => handleChangeStatsProfileField("alias", event.target.value)}
                placeholder={uiText.imcCommitTrackingAliasPlaceholder}
              />
            </label>

            <label className="imc-field" htmlFor="stats-country">
              {uiText.imcCommitTrackingCountryLabel}
              <input
                id="stats-country"
                type="text"
                value={statsProfile.country}
                onChange={(event) => handleChangeStatsProfileField("country", event.target.value)}
                placeholder={uiText.imcCommitTrackingCountryPlaceholder}
              />
            </label>

            <label className="imc-field" htmlFor="stats-age">
              {uiText.imcCommitTrackingAgeLabel}
              <input
                id="stats-age"
                type="number"
                inputMode="numeric"
                min="1"
                max="120"
                value={statsProfile.age}
                onChange={(event) => handleChangeStatsProfileField("age", event.target.value)}
                placeholder={uiText.imcCommitTrackingAgePlaceholder}
              />
            </label>

            <div className="data-consent-actions">
              <button
                className="menu-nav-button"
                onClick={handleSubmitDataConsent}
                disabled={isSubmittingDataConsent}
              >
                {isSubmittingDataConsent
                  ? `${premiumSignupFlowCopy.save}...`
                  : premiumSignupFlowCopy.save}
              </button>
              <p className="data-consent-step-label">{premiumSignupFlowCopy.step2}</p>
              <button className="menu-nav-button" type="button" onClick={handleContinueToPlaySubscription}>
                {premiumSignupFlowCopy.continueToSubscription}
              </button>
              <button className="menu-nav-button" onClick={handleCloseDataConsent}>
                {uiText.close}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      <ImcModal
        isOpen={isImcOpen}
        initialFlowStep={imcInitialFlowStep}
        directRecommendation={imcDirectCalories}
        isPremiumUser={isPremiumUser}
        onRequestPremiumInfo={handleOpenPremiumInfo}
        uiText={uiText}
        imcSex={imcSex}
        onSexChange={setImcSex}
        imcWeight={imcWeight}
        onWeightChange={setImcWeight}
        imcHeight={imcHeight}
        onHeightChange={setImcHeight}
        imcValue={imcValue}
        imcCategory={imcCategory}
        imcRecommendation={imcRecommendation}
        onClose={handleCloseImc}
        onConfirmStart={handleConfirmImcStart}
      />
    </div>
    )
  );
}

export default App;
