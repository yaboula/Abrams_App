const I18N = {
  es: {
    header: {
      tag: "ABRAMS RP // SINDICATO",
      title_1: "GANG",
      title_2: "MATRIX",
      status_blank: "DOSSIER EN BLANCO",
      status_incomplete: "DOSSIER INCOMPLETO",
      status_collecting: "RECOPILANDO DATOS",
      status_partial: "DATOS PARCIALES",
      status_analyzing: "ANALIZANDO ECONOMÍA",
      status_mapping: "MAPEANDO TERRITORIO",
      status_squad: "ESCUADRA REGISTRADA",
      status_complete: "DOSSIER COMPLETO",
      transmitting: "TRANSMITIENDO...",
      transmitting_step: "ENCRIPTANDO Y TRANSMITIENDO...",
      transmit_error: "TRANSMISIÓN INTERCEPTADA — REINTENTAR",
      transmit_btn: "[ TRANSMITIR DOSSIER AL ALTO MANDO ]",
      analysis: "[ ANÁLISIS EN CURSO... ]",
      encrypted: "DATOS CIFRADOS"
    },
    success: {
      title: "DOSSIER TRANSMITIDO",
      description: "Encriptación completa. Esperando revisión del alto mando."
    },
    nodes: {
      pending: "PENDIENTE",
      verified: "VERIFICADO",
      n1_title: "OPERADOR", n1_sub: "Datos OOC del operador",
      n2_title: "IDENTIDAD", n2_sub: "Lore y tipología IC",
      n3_title: "LOGÍSTICA", n3_sub: "Economía y recursos",
      n4_title: "TÁCTICA", n4_sub: "Zona de operaciones",
      n5_title: "ESCUADRA", n5_sub: "Roster y jerarquía",
      n6_title: "PROTOCOLO", n6_sub: "Diplomacia y normas"
    },
    modals: {
      save_btn: "GUARDAR Y ENCRIPTAR",
      m1: {
        title: "DATOS FUERA DE PERSONAJE",
        name: "Nombre / Alias OOC", name_ph: "Tu nombre real o alias",
        age: "Edad OOC",
        discord: "Discord Tag", discord_ph: "usuario#0000",
        exp: "Experiencia en Roleplay", exp_ph: "Describe tu experiencia previa en servidores de RP..."
      },
      m2: {
        title: "IDENTIDAD CORPORATIVA",
        org_name: "Nombre de la Organización", org_name_ph: "Ej: Vagos, Ballas, cartel...",
        typology: "TIPOLOGÍA CRIMINAL",
        type_street: "Banda Callejera", type_mafia: "Mafia / Familia", type_cartel: "Cártel", type_mc: "Motoclub (MC)", type_org: "Organización Clandestina", type_other: "Otro",
        goals_short: "Objetivos a Corto Plazo", goals_short_ph: "Primeros pasos en la ciudad...",
        goals_long: "Objetivos a Largo Plazo", goals_long_ph: "Visión de la facción a meses vista...",
        aesthetics: "ESTÉTICA Y CULTURA",
        clothing: "Vestimenta y Rasgos Identificativos", clothing_ph: "Colores, tatuajes obligatorios, vehículos representativos...",
        lore_title: "LORE DOCUMENT / MANIFIESTO",
        lore_ph: "Escribe el trasfondo (Lore) de la organización..."
      },
      m3: {
        title: "MATRIZ ECONÓMICA Y RECURSOS",
        dist_title: "DISTRIBUCIÓN DE OPERACIONES (%)",
        points: "Puntos Disponibles",
        drugs: "Narcotráfico", weapons: "Tráfico de Armas", extortion: "Extorsión / Cobros", robbery: "Robos a Gran Escala", laundering: "Blanqueo de Capitales",
        front: "Negocio Tapadera / Actividad Legal", front_ph: "Describe tu fachada legal para blanquear ingresos..."
      },
      m4: {
        title: "SELECCIÓN DE TERRITORIO",
        zone: "Zona Principal (Selecciona en el mapa)", zone_unselected: "[ ZONA NO SELECCIONADA ]",
        details: "Ubicación Estratégica / Detalles (Opcional)", details_ph: "Describe calles, bloques o edificios específicos de tu HQ...",
        zone_prefix: "ZONA:",
        zones: {
          z1: "Norte (Paleto, Chiliad)",
          z2: "Condado de Blaine (Sandy, Senora)",
          z3: "Vinewood y Rockford Hills",
          z4: "Oeste (Vespucci, Del Perro)",
          z5: "Sur y Centro (Davis, Downtown)",
          z6: "Este y Espejo (Mirror Park, East LS)",
          z7: "Puerto Sur (Elysian y Terminal)"
        }
      },
      m5: {
        title: "USO HORARIO",
        timezone: "Horario Operativo Principal (Zona Horaria)", timezone_ph: "Ej: CET (20:00 - 02:00)",
        roster_title: "MIEMBROS DEL ESCUADRÓN",
        add_btn: "+ AÑADIR OPERATIVO",
        leader: "LÍDER", operative: "OPERATIVO",
        name_ic: "Nombre IC", name_ic_ph: "Nombre en personaje",
        discord: "Discord OOC",
        rank: "Rango", rank_ph: "Soldado, Sicario, etc."
      },
      m6: {
        stance: "Postura de Alianzas", stance_ph: "¿Sois aislacionistas, agresivos o buscáis alianzas? Explica tu postura diplomática...",
        protocol_title: "PROTOCOLO DE SEGURIDAD — MANTÉN PULSADO PARA DESBLOQUEAR",
        rules: [
          "Tolerancia Cero: Cualquier comportamiento tóxico, metagaming, powergaming o failRP resultará en sanción inmediata.",
          "Economía Real: El sistema económico es realista. No se permiten métodos de farming abusivos ni exploits.",
          "No Ayudas Iniciales: Ningún miembro del staff proporcionará ventajas iniciales a organizaciones nuevas.",
          "Aceptación de CK: Todos los miembros aceptan la posibilidad de Character Kill bajo circunstancias válidas de RP."
        ],
        rule_1: "Tolerancia Cero: Cualquier comportamiento tóxico, metagaming, powergaming o failRP resultará en sanción inmediata.",
        rule_2: "Economía Real: El sistema económico es realista. No se permiten métodos de farming abusivos ni exploits.",
        rule_3: "No Ayudas Iniciales: Ningún miembro del staff proporcionará ventajas iniciales a organizaciones nuevas.",
        rule_4: "Aceptación de CK: Todos los miembros aceptan la posibilidad de Character Kill bajo circunstancias válidas de RP."
      }
    }
  },
  en: {
    header: {
      tag: "ABRAMS RP // SYNDICATE",
      title_1: "GANG",
      title_2: "MATRIX",
      status_blank: "BLANK DOSSIER",
      status_incomplete: "INCOMPLETE DOSSIER",
      status_collecting: "COLLECTING DATA",
      status_partial: "PARTIAL DATA",
      status_analyzing: "ANALYZING ECONOMY",
      status_mapping: "MAPPING TERRITORY",
      status_squad: "SQUAD REGISTERED",
      status_complete: "DOSSIER COMPLETE",
      transmitting: "TRANSMITTING...",
      transmitting_step: "ENCRYPTING AND TRANSMITTING...",
      transmit_error: "TRANSMISSION INTERCEPTED — RETRY",
      transmit_btn: "[ TRANSMIT DOSSIER TO HIGH COMMAND ]",
      analysis: "[ ANALYSIS IN PROGRESS... ]",
      encrypted: "ENCRYPTED DATA"
    },
    success: {
      title: "DOSSIER TRANSMITTED",
      description: "Encryption complete. Awaiting high command review."
    },
    nodes: {
      pending: "PENDING",
      verified: "VERIFIED",
      n1_title: "OPERATOR", n1_sub: "OOC Operator Data",
      n2_title: "IDENTITY", n2_sub: "IC Lore and Typology",
      n3_title: "LOGISTICS", n3_sub: "Economy and Resources",
      n4_title: "TACTICS", n4_sub: "Operations Zone",
      n5_title: "SQUAD", n5_sub: "Roster and Hierarchy",
      n6_title: "PROTOCOL", n6_sub: "Diplomacy and Rules"
    },
    modals: {
      save_btn: "SAVE & ENCRYPT",
      m1: {
        title: "OUT OF CHARACTER DATA",
        name: "Name / OOC Alias", name_ph: "Your real name or alias",
        age: "OOC Age",
        discord: "Discord Tag", discord_ph: "user#0000",
        exp: "Roleplay Experience", exp_ph: "Describe your previous experience in RP servers..."
      },
      m2: {
        title: "CORPORATE IDENTITY",
        org_name: "Organization Name", org_name_ph: "Ex: Vagos, Ballas, cartel...",
        typology: "CRIMINAL TYPOLOGY",
        type_street: "Street Gang", type_mafia: "Mafia / Family", type_cartel: "Cartel", type_mc: "Motorcycle Club (MC)", type_org: "Clandestine Org", type_other: "Other",
        goals_short: "Short Term Goals", goals_short_ph: "First steps in the city...",
        goals_long: "Long Term Goals", goals_long_ph: "Faction's vision months ahead...",
        aesthetics: "AESTHETICS AND CULTURE",
        clothing: "Clothing and Identifying Traits", clothing_ph: "Colors, mandatory tattoos, representative vehicles...",
        lore_title: "LORE DOCUMENT / MANIFESTO",
        lore_ph: "Write the organization's background (Lore)..."
      },
      m3: {
        title: "ECONOMIC MATRIX AND RESOURCES",
        dist_title: "OPERATIONS DISTRIBUTION (%)",
        points: "Available Points",
        drugs: "Narcotrafficking", weapons: "Weapons Trafficking", extortion: "Extortion / Collections", robbery: "Large-Scale Heists", laundering: "Money Laundering",
        front: "Front Business / Legal Activity", front_ph: "Describe your legal front to launder income..."
      },
      m4: {
        title: "TERRITORY SELECTION",
        zone: "Main Zone (Select on map)", zone_unselected: "[ UNSELECTED ZONE ]",
        details: "Strategic Location / Details (Optional)", details_ph: "Describe specific streets, blocks, or buildings of your HQ...",
        zone_prefix: "ZONE:",
        zones: {
          z1: "North (Paleto, Chiliad)",
          z2: "Blaine County (Sandy, Senora)",
          z3: "Vinewood and Rockford Hills",
          z4: "West (Vespucci, Del Perro)",
          z5: "South and Central (Davis, Downtown)",
          z6: "East and Mirror (Mirror Park, East LS)",
          z7: "South Port (Elysian and Terminal)"
        }
      },
      m5: {
        title: "TIMEZONE",
        timezone: "Main Operating Hours (Timezone)", timezone_ph: "Ex: EST (20:00 - 02:00)",
        roster_title: "SQUAD MEMBERS",
        add_btn: "+ ADD OPERATIVE",
        leader: "LEADER", operative: "OPERATIVE",
        name_ic: "IC Name", name_ic_ph: "In-character name",
        discord: "OOC Discord",
        rank: "Rank", rank_ph: "Soldier, Hitman, etc."
      },
      m6: {
        stance: "Alliances Stance", stance_ph: "Are you isolationists, aggressive, or seeking alliances? Explain your diplomatic stance...",
        protocol_title: "SECURITY PROTOCOL — HOLD TO UNLOCK",
        rules: [
          "Zero Tolerance: Any toxic behavior, metagaming, powergaming or failRP will result in immediate sanction.",
          "Real Economy: The economic system is realistic. Abusive farming methods and exploits are not allowed.",
          "No Starter Boosts: No staff member will provide initial advantages to new organizations.",
          "CK Acceptance: All members accept the possibility of Character Kill under valid RP circumstances."
        ],
        rule_1: "Zero Tolerance: Any toxic behavior, metagaming, powergaming or failRP will result in immediate sanction.",
        rule_2: "Real Economy: The economic system is realistic. Abusive farming methods and exploits are not allowed.",
        rule_3: "No Starter Boosts: No staff member will provide initial advantages to new organizations.",
        rule_4: "CK Acceptance: All members accept the possibility of Character Kill under valid RP circumstances."
      }
    }
  },
  fr: {
    header: {
      tag: "ABRAMS RP // SYNDICAT",
      title_1: "GANG",
      title_2: "MATRIX",
      status_blank: "DOSSIER VIERGE",
      status_incomplete: "DOSSIER INCOMPLET",
      status_collecting: "COLLECTE DE DONNÉES",
      status_partial: "DONNÉES PARTIELLES",
      status_analyzing: "ANALYSE DE L'ÉCONOMIE",
      status_mapping: "CARTOGRAPHIE DU TERRITOIRE",
      status_squad: "ESCOUADE ENREGISTRÉE",
      status_complete: "DOSSIER COMPLÉTÉ",
      transmitting: "TRANSMISSION...",
      transmitting_step: "CHIFFREMENT ET TRANSMISSION...",
      transmit_error: "TRANSMISSION INTERCEPTÉE — RÉESSAYER",
      transmit_btn: "[ TRANSMETTRE LE DOSSIER AU HAUT COMMANDEMENT ]",
      analysis: "[ ANALYSE EN COURS... ]",
      encrypted: "DONNÉES CHIFFRÉES"
    },
    success: {
      title: "DOSSIER TRANSMIS",
      description: "Chiffrement terminé. En attente de révision par le haut commandement."
    },
    nodes: {
      pending: "EN ATTENTE",
      verified: "VÉRIFIÉ",
      n1_title: "OPÉRATEUR", n1_sub: "Données HRP de l'opérateur",
      n2_title: "IDENTITÉ", n2_sub: "Lore et typologie RP",
      n3_title: "LOGISTIQUE", n3_sub: "Économie et ressources",
      n4_title: "TACTIQUE", n4_sub: "Zone d'opérations",
      n5_title: "ESCOUADE", n5_sub: "Effectif et hiérarchie",
      n6_title: "PROTOCOLE", n6_sub: "Diplomatie et règles"
    },
    modals: {
      save_btn: "SAUVEGARDER ET CHIFFRER",
      m1: {
        title: "DONNÉES HORS PERSONNAGE",
        name: "Nom / Alias HRP", name_ph: "Votre vrai nom ou alias",
        age: "Âge HRP",
        discord: "Tag Discord", discord_ph: "utilisateur#0000",
        exp: "Expérience en Roleplay", exp_ph: "Décrivez votre expérience précédente sur les serveurs RP..."
      },
      m2: {
        title: "IDENTITÉ CORPORATIVE",
        org_name: "Nom de l'organisation", org_name_ph: "Ex: Vagos, Ballas, cartel...",
        typology: "TYPOLOGIE CRIMINELLE",
        type_street: "Gang de Rue", type_mafia: "Mafia / Famille", type_cartel: "Cartel", type_mc: "Club de Motards (MC)", type_org: "Organisation Clandestine", type_other: "Autre",
        goals_short: "Objectifs à Court Terme", goals_short_ph: "Premiers pas dans la ville...",
        goals_long: "Objectifs à Long Terme", goals_long_ph: "Vision de la faction à long terme...",
        aesthetics: "ESTHÉTIQUE ET CULTURE",
        clothing: "Vêtements et Traits Distinctifs", clothing_ph: "Couleurs, tatouages obligatoires, véhicules représentatifs...",
        lore_title: "DOCUMENT LORE / MANIFESTE",
        lore_ph: "Écrivez l'histoire (Lore) de l'organisation..."
      },
      m3: {
        title: "MATRICE ÉCONOMIQUE ET RESSOURCES",
        dist_title: "DISTRIBUTION DES OPÉRATIONS (%)",
        points: "Points Disponibles",
        drugs: "Narcotrafic", weapons: "Trafic d'Armes", extortion: "Extorsion / Recouvrements", robbery: "Braquages à Grande Échelle", laundering: "Blanchiment d'Argent",
        front: "Entreprise de Couverture / Activité Légale", front_ph: "Décrivez votre façade légale pour blanchir les revenus..."
      },
      m4: {
        title: "SÉLECTION DE TERRITOIRE",
        zone: "Zone Principale (Sélectionnez sur la carte)", zone_unselected: "[ ZONE NON SÉLECTIONNÉE ]",
        details: "Emplacement Stratégique / Détails (Optionnel)", details_ph: "Décrivez les rues, blocs ou bâtiments spécifiques de votre QG...",
        zone_prefix: "ZONE:",
        zones: {
          z1: "Nord (Paleto, Chiliad)",
          z2: "Comté de Blaine (Sandy, Senora)",
          z3: "Vinewood et Rockford Hills",
          z4: "Ouest (Vespucci, Del Perro)",
          z5: "Sud et Centre (Davis, Downtown)",
          z6: "Est et Miroir (Mirror Park, East LS)",
          z7: "Port Sud (Elysian et Terminal)"
        }
      },
      m5: {
        title: "FUSEAU HORAIRE",
        timezone: "Heures d'Opération Principales", timezone_ph: "Ex: CET (20:00 - 02:00)",
        roster_title: "MEMBRES DE L'ESCOUADE",
        add_btn: "+ AJOUTER AGENT",
        leader: "LEADER", operative: "AGENT",
        name_ic: "Nom RP", name_ic_ph: "Nom en jeu",
        discord: "Discord HRP",
        rank: "Rang", rank_ph: "Soldat, Tueur à gages, etc."
      },
      m6: {
        stance: "Position sur les Alliances", stance_ph: "Êtes-vous isolationnistes, agressifs, ou cherchez-vous des alliances ? Expliquez votre position...",
        protocol_title: "PROTOCOLE DE SÉCURITÉ — MAINTENEZ POUR DÉVERROUILLER",
        rules: [
          "Tolérance Zéro: Tout comportement toxique, metagaming, powergaming ou failRP entraînera une sanction immédiate.",
          "Économie Réelle: Le système économique est réaliste. Les méthodes de farming abusives et les exploits sont interdits.",
          "Aucune Aide de Départ: Aucun membre du staff ne fournira d'avantages initiaux aux nouvelles organisations.",
          "Acceptation du CK: Tous les membres acceptent la possibilité du Character Kill dans des circonstances valides de RP."
        ],
        rule_1: "Tolérance Zéro: Tout comportement toxique, metagaming, powergaming ou failRP entraînera une sanction immédiate.",
        rule_2: "Économie Réelle: Le système économique est réaliste. Les méthodes de farming abusives et les exploits sont interdits.",
        rule_3: "Aucune Aide de Départ: Aucun membre du staff ne fournira d'avantages initiaux aux nouvelles organisations.",
        rule_4: "Acceptation du CK: Tous les membres acceptent la possibilité du Character Kill dans des circonstances valides de RP."
      }
    }
  }
};

window.I18N = I18N;
window.currentLang = 'es';

window.t = function(path) {
  const keys = path.split('.');
  let current = window.I18N[window.currentLang];
  for (let key of keys) {
    if (current[key] === undefined) return path;
    current = current[key];
  }
  return current;
};
