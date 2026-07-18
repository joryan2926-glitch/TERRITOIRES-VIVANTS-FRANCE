import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";

import { colors, radius, shadow } from "./src/theme";
import {
  checklistByFlow,
  contactChannels,
  documentGroups,
  documents,
  fieldLabels,
  flowGuides,
  flowLabels,
  homeActions,
  materialCategories,
  nextSteps,
  propertyTypes,
  requiredFieldsByFlow,
  signalCategories,
  statusSteps
} from "./src/data";
import { buildRequestPayload } from "./src/services/requestPayload";
import { submitMobileRequest } from "./src/services/requestRepository";
import { getSupabaseConfigStatus } from "./src/services/supabaseClient";

const logo = require("./assets/tvf-mobile-logo.png");

const SUBMISSION_HISTORY_KEY = "tvf-mobile-submission-history";
const DRAFT_STORAGE_KEY = "tvf-mobile-current-draft";

async function loadSubmissionHistory() {
  try {
    const raw = await AsyncStorage.getItem(SUBMISSION_HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.slice(0, 8) : [];
  } catch {
    return [];
  }
}

async function saveSubmissionHistory(items) {
  try {
    await AsyncStorage.setItem(SUBMISSION_HISTORY_KEY, JSON.stringify(items.slice(0, 8)));
  } catch {
    // Le suivi local reste optionnel : l'envoi Supabase ne doit jamais etre bloque par le stockage du telephone.
  }
}

const initialDraft = {
  category: "",
  title: "",
  address: "",
  description: "",
  contactName: "",
  email: "",
  phone: "",
  quantity: "",
  condition: "",
  availability: "",
  objective: "",
  skills: "",
  photoUri: "",
  photoFileName: "",
  latitude: "",
  longitude: "",
  locationAccuracy: ""
};


function hasDraftContent(draft) {
  return Object.values(draft || {}).some((value) => String(value || "").trim());
}

async function loadDraft() {
  try {
    const raw = await AsyncStorage.getItem(DRAFT_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object" ? { ...initialDraft, ...parsed } : initialDraft;
  } catch {
    return initialDraft;
  }
}

async function saveDraft(draft) {
  try {
    if (!hasDraftContent(draft)) {
      await AsyncStorage.removeItem(DRAFT_STORAGE_KEY);
      return;
    }
    await AsyncStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Le brouillon local reste un confort utilisateur et ne bloque jamais l'envoi.
  }
}

async function clearDraftStorage() {
  try {
    await AsyncStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    // Rien a faire : le formulaire sera quand meme remis a zero dans l'application.
  }
}
const flowCategoryOptions = {
  signal: signalCategories,
  materials: materialCategories,
  property: propertyTypes,
  volunteer: [],
  tracking: []
};

function buildReference(flow) {
  const prefix = {
    signal: "SIG",
    materials: "MAT",
    property: "BIEN",
    volunteer: "BEN"
  }[flow] || "TVF";
  const stamp = Date.now().toString().slice(-6);
  return `TVF-${prefix}-${stamp}`;
}

function getCategoryLabel(flow, value) {
  const options = flowCategoryOptions[flow] || [];
  const found = options.find((item) => (typeof item === "string" ? item : item.key) === value);
  if (!found) return value || "Non renseignée";
  return typeof found === "string" ? found : found.label;
}

function validateDraft(flow, draft) {
  const required = requiredFieldsByFlow[flow] || [];
  const missing = required.filter((field) => !String(draft[field] || "").trim());
  if (["materials", "property"].includes(flow) && !draft.email.trim() && !draft.phone.trim()) {
    missing.push("contactMethod");
  }
  return [...new Set(missing)];
}

function AppHeader({ screen, onBack, onContact }) {
  const canGoBack = screen !== "home";
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={[styles.headerButton, !canGoBack && styles.headerButtonMuted]}
        onPress={canGoBack ? onBack : undefined}
        accessibilityLabel="Retour"
      >
        <Ionicons name={canGoBack ? "chevron-back" : "leaf-outline"} size={22} color={colors.green} />
      </TouchableOpacity>
      <View style={styles.headerBrand}>
        <Image source={logo} style={styles.headerLogo} />
        <View>
          <Text style={styles.headerTitle}>TVF Mobile</Text>
          <Text style={styles.headerSubtitle}>Signaler. Localiser. Agir.</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.headerButton} onPress={onContact} accessibilityLabel="Contacter TVF">
        <Ionicons name="call-outline" size={21} color={colors.green} />
      </TouchableOpacity>
    </View>
  );
}

function ScreenTitle({ eyebrow, title, children }) {
  return (
    <View style={styles.screenTitle}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      {children ? <Text style={styles.lead}>{children}</Text> : null}
    </View>
  );
}

function PrimaryButton({ children, icon = "arrow-forward-outline", onPress, secondary, loading, disabled }) {
  const inactive = Boolean(disabled || loading);
  return (
    <TouchableOpacity
      style={[styles.primaryButton, secondary && styles.secondaryButton, inactive && styles.buttonDisabled]}
      onPress={inactive ? undefined : onPress}
      activeOpacity={0.86}
      disabled={inactive}
    >
      {loading ? <ActivityIndicator color={secondary ? colors.green : colors.white} /> : null}
      <Text style={[styles.primaryButtonText, secondary && styles.secondaryButtonText]}>{children}</Text>
      {!loading ? <Ionicons name={icon} size={18} color={secondary ? colors.green : colors.white} /> : null}
    </TouchableOpacity>
  );
}

function Card({ icon, title, subtitle, onPress, primary }) {
  return (
    <TouchableOpacity style={[styles.card, primary && styles.cardPrimary]} onPress={onPress} activeOpacity={0.86}>
      <View style={[styles.cardIcon, primary && styles.cardIconPrimary]}>
        <Ionicons name={icon} size={23} color={primary ? colors.green : colors.green} />
      </View>
      <View style={styles.cardText}>
        <Text style={[styles.cardTitle, primary && styles.cardTitlePrimary]}>{title}</Text>
        <Text style={[styles.cardSubtitle, primary && styles.cardSubtitlePrimary]}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={19} color={primary ? colors.white : colors.muted} />
    </TouchableOpacity>
  );
}

function Field({ label, value = "", onChangeText = () => {}, placeholder, multiline, keyboardType, autoCapitalize = "sentences" }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8A968F"
        multiline={multiline}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );
}

function PillPicker({ items, selected, onSelect }) {
  return (
    <View style={styles.pillGrid}>
      {items.map((item) => {
        const value = typeof item === "string" ? item : item.key;
        const label = typeof item === "string" ? item : item.label;
        const icon = typeof item === "string" ? "ellipse-outline" : item.icon;
        const active = selected === value || selected === label;
        return (
          <TouchableOpacity key={value} style={[styles.pill, active && styles.pillActive]} onPress={() => onSelect(value)}>
            <Ionicons name={icon} size={18} color={active ? colors.white : colors.green} />
            <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function MediaCapture({ draft, setDraft, label = "Ajouter une photo" }) {
  const [busy, setBusy] = useState(false);

  const saveAsset = (asset) => {
    setDraft({
      ...draft,
      photoUri: asset.uri,
      photoFileName: asset.fileName || "photo-tvf-mobile.jpg"
    });
  };

  const openLibrary = async () => {
    setBusy(true);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Autorisation nécessaire", "TVF Mobile a besoin de l'accès aux photos pour joindre une image au dossier.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.75
      });
      if (!result.canceled && result.assets?.length) saveAsset(result.assets[0]);
    } finally {
      setBusy(false);
    }
  };

  const openCamera = async () => {
    setBusy(true);
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Autorisation nécessaire", "TVF Mobile a besoin de l'appareil photo pour documenter une demande.");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.72
      });
      if (!result.canceled && result.assets?.length) saveAsset(result.assets[0]);
    } finally {
      setBusy(false);
    }
  };

  const choosePhotoSource = () => {
    Alert.alert("Ajouter une photo", "Choisissez la source de l'image.", [
      { text: "Appareil photo", onPress: openCamera },
      { text: "Photothèque", onPress: openLibrary },
      { text: "Annuler", style: "cancel" }
    ]);
  };

  const clearPhoto = () => {
    setDraft({ ...draft, photoUri: "", photoFileName: "" });
  };

  return (
    <View style={styles.mediaWrap}>
      <TouchableOpacity style={styles.photoBox} activeOpacity={0.82} onPress={choosePhotoSource}>
        {busy ? <ActivityIndicator color={colors.green} /> : <Ionicons name="camera-outline" size={30} color={colors.green} />}
        <Text style={styles.photoTitle}>{draft.photoUri ? "Photo ajoutée" : label}</Text>
        {draft.photoUri ? <Image source={{ uri: draft.photoUri }} style={styles.photoPreview} /> : null}
        <Text style={styles.photoText}>{draft.photoUri ? "La photo sera jointe à la demande lors de la connexion TVF OS." : "Prendre une photo ou choisir une image existante."}</Text>
      </TouchableOpacity>
      {draft.photoUri ? <PrimaryButton secondary icon="trash-outline" onPress={clearPhoto}>Retirer la photo</PrimaryButton> : null}
    </View>
  );
}
function LocationCapture({ draft, setDraft }) {
  const [busy, setBusy] = useState(false);

  const captureLocation = async () => {
    setBusy(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert("Autorisation nécessaire", "TVF Mobile a besoin de la localisation pour rattacher la demande à un lieu.");
        return;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setDraft({
        ...draft,
        latitude: String(position.coords.latitude),
        longitude: String(position.coords.longitude),
        locationAccuracy: String(Math.round(position.coords.accuracy || 0))
      });
    } catch (error) {
      Alert.alert("Localisation indisponible", "La position n'a pas pu être récupérée. Vous pouvez indiquer l'adresse manuellement.");
    } finally {
      setBusy(false);
    }
  };

  const hasLocation = draft.latitude && draft.longitude;
  return (
    <TouchableOpacity style={[styles.locationBox, hasLocation && styles.locationBoxActive]} onPress={captureLocation} activeOpacity={0.84}>
      {busy ? <ActivityIndicator color={colors.green} /> : <Ionicons name="navigate-outline" size={22} color={hasLocation ? colors.white : colors.green} />}
      <View style={styles.locationTextWrap}>
        <Text style={[styles.locationTitle, hasLocation && styles.locationTitleActive]}>{hasLocation ? "Position enregistrée" : "Utiliser ma position"}</Text>
        <Text style={[styles.locationText, hasLocation && styles.locationTextActive]}>
          {hasLocation ? `${Number(draft.latitude).toFixed(5)}, ${Number(draft.longitude).toFixed(5)}` : "Complète l'adresse avec un repère GPS."}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
function ErrorBox({ missing }) {
  if (!missing.length) return null;
  return (
    <View style={styles.errorBox}>
      <Ionicons name="alert-circle-outline" size={20} color={colors.danger} />
      <Text style={styles.errorText}>
        Complétez : {missing.map((field) => fieldLabels[field] || field).join(", ")}.
      </Text>
    </View>
  );
}

function Notice({ children }) {
  return (
    <View style={styles.notice}>
      <Ionicons name="information-circle-outline" size={20} color={colors.green} />
      <Text style={styles.noticeText}>{children}</Text>
    </View>
  );
}

function FlowGuide({ flow }) {
  const steps = flowGuides[flow] || [];
  if (!steps.length) return null;
  return (
    <View style={styles.guideCard}>
      {steps.map((step, index) => (
        <View key={step} style={styles.guideStep}>
          <View style={styles.guideNumber}><Text style={styles.guideNumberText}>{index + 1}</Text></View>
          <Text style={styles.guideText}>{step}</Text>
          {index < steps.length - 1 ? <Ionicons name="chevron-forward" size={14} color={colors.gold} /> : null}
        </View>
      ))}
    </View>
  );
}

function Checklist({ flow }) {
  const items = checklistByFlow[flow] || [];
  if (!items.length) return null;
  return (
    <View style={styles.checklistCard}>
      <Text style={styles.checklistTitle}>Avant d'envoyer</Text>
      {items.map((item) => (
        <View key={item} style={styles.checkRow}>
          <Ionicons name="checkmark-circle-outline" size={18} color={colors.green2} />
          <Text style={styles.checkText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function ContactFields({ draft, setDraft, required }) {
  return (
    <View style={styles.contactCard}>
      <View style={styles.contactHeader}>
        <Ionicons name="person-circle-outline" size={22} color={colors.green} />
        <View style={styles.contactHeaderText}>
          <Text style={styles.contactTitle}>Coordonnées de suivi</Text>
          <Text style={styles.contactHint}>{required ? "Nécessaires pour traiter la demande." : "Facultatif, mais utile si TVF doit recontacter."}</Text>
        </View>
      </View>
      <Field label="Nom et prénom" value={draft.contactName} onChangeText={(contactName) => setDraft({ ...draft, contactName })} placeholder="Votre identité" />
      <Field label="E-mail" value={draft.email} onChangeText={(email) => setDraft({ ...draft, email })} placeholder="exemple@mail.fr" keyboardType="email-address" autoCapitalize="none" />
      <Field label="Téléphone" value={draft.phone} onChangeText={(phone) => setDraft({ ...draft, phone })} placeholder="Votre numéro" keyboardType="phone-pad" />
    </View>
  );
}

function RequestPreview({ flow, draft }) {
  return (
    <View style={styles.previewCard}>
      <Text style={styles.previewTitle}>Résumé de transmission</Text>
      <Text style={styles.previewLine}>Objet : {flowLabels[flow] || "Demande TVF"}</Text>
      <Text style={styles.previewLine}>Catégorie : {getCategoryLabel(flow, draft.category)}</Text>
      <Text style={styles.previewLine}>Localisation : {draft.address || "À renseigner"}</Text>
      <Text style={styles.previewLine}>Contact : {draft.email || draft.phone || "Non renseigné"}</Text>
      <Text style={styles.previewLine}>Photo : {draft.photoUri ? "jointe" : "non jointe"}</Text>
    </View>
  );
}
function ConfigBanner() {
  const status = getSupabaseConfigStatus();
  return (
    <View style={[styles.configBanner, status.configured && styles.configBannerReady]}>
      <View style={[styles.configIcon, status.configured && styles.configIconReady]}>
        <Ionicons name={status.configured ? "cloud-done-outline" : "phone-portrait-outline"} size={20} color={status.configured ? colors.white : colors.green} />
      </View>
      <View style={styles.configTextWrap}>
        <Text style={styles.configTitle}>{status.title}</Text>
        <Text style={styles.configText}>{status.message}</Text>
      </View>
    </View>
  );
}
function HomeScreen({ go, draftRestored }) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ScreenTitle eyebrow="Préversion terrain" title="Une application terrain simple pour TVF">
        Signaler un lieu, proposer des matériaux ou déposer une première demande en quelques étapes.
      </ScreenTitle>
      <View style={styles.logoPanel}>
        <Image source={logo} style={styles.logoLarge} />
        <View style={styles.logoCopy}>
          <Text style={styles.logoPanelTitle}>Pensée pour le terrain</Text>
          <Text style={styles.logoPanelText}>Chaque saisie doit pouvoir devenir une demande exploitable dans TVF OS.</Text>
        </View>
      </View>
      <ConfigBanner />
      {draftRestored ? (
        <TouchableOpacity style={styles.draftBanner} onPress={() => go("signal")} activeOpacity={0.86}>
          <View style={styles.draftBannerIcon}>
            <Ionicons name="create-outline" size={20} color={colors.white} />
          </View>
          <View style={styles.draftBannerText}>
            <Text style={styles.draftBannerTitle}>Brouillon restauré</Text>
            <Text style={styles.draftBannerCopy}>Une demande commencée a été retrouvée sur ce téléphone.</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.green} />
        </TouchableOpacity>
      ) : null}
      <View style={styles.quickStats}>
        <View style={styles.statMini}><Text style={styles.statMiniValue}>4</Text><Text style={styles.statMiniLabel}>parcours clés</Text></View>
        <View style={styles.statMini}><Text style={styles.statMiniValue}>1</Text><Text style={styles.statMiniLabel}>suivi TVF OS</Text></View>
        <View style={styles.statMini}><Text style={styles.statMiniValue}>0</Text><Text style={styles.statMiniLabel}>donnée fictive</Text></View>
      </View>
      <View style={styles.stack}>
        {homeActions.map((action) => (
          <Card
            key={action.key}
            icon={action.icon}
            title={action.title}
            subtitle={action.subtitle}
            primary={action.primary}
            onPress={() => go(action.key, { resetDraft: ["signal", "materials", "property", "volunteer"].includes(action.key) })}
          />
        ))}
      </View>
    </ScrollView>
  );
}

function SignalScreen({ draft, setDraft, submit, missing, submitting }) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ScreenTitle eyebrow="Signalement" title="Décrire un lieu à vérifier">
        Le signalement sert à repérer une situation, puis à la qualifier avant toute action.
      </ScreenTitle>
      <FlowGuide flow="signal" />
      <PillPicker items={signalCategories} selected={draft.category} onSelect={(category) => setDraft({ ...draft, category })} />
      <MediaCapture draft={draft} setDraft={setDraft} />
      <LocationCapture draft={draft} setDraft={setDraft} />
      <Field label="Adresse ou repère" value={draft.address} onChangeText={(address) => setDraft({ ...draft, address })} placeholder="Rue, commune, quartier..." />
      <Field label="Description courte" value={draft.description} onChangeText={(description) => setDraft({ ...draft, description })} placeholder="Que faut-il savoir ?" multiline />
      <ContactFields draft={draft} setDraft={setDraft} />
      <Notice>Ne prenez pas de photo en entrant dans une propriété privée sans autorisation.</Notice>
      <Checklist flow="signal" />
      <RequestPreview flow="signal" draft={draft} />
      <ErrorBox missing={missing} />
      <PrimaryButton loading={submitting} onPress={() => submit("signal")}>{submitting ? "Transmission..." : "Envoyer à TVF"}</PrimaryButton>
    </ScrollView>
  );
}

function MaterialsScreen({ draft, setDraft, submit, missing, submitting }) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ScreenTitle eyebrow="Matériaux" title="Proposer une ressource réutilisable">
        Les matériaux sont étudiés par TVF avant toute acceptation, collecte ou affectation à un projet.
      </ScreenTitle>
      <FlowGuide flow="materials" />
      <PillPicker items={materialCategories} selected={draft.category} onSelect={(category) => setDraft({ ...draft, category })} />
      <Field label="Quantité / dimensions" value={draft.quantity} onChangeText={(quantity) => setDraft({ ...draft, quantity })} placeholder="Ex. 12 portes, 30 m² de carrelage..." />
      <Field label="État général" value={draft.condition} onChangeText={(condition) => setDraft({ ...draft, condition })} placeholder="Neuf, bon état, à vérifier..." />
      <Field label="Lieu de stockage" value={draft.address} onChangeText={(address) => setDraft({ ...draft, address })} placeholder="Adresse ou commune" />
      <LocationCapture draft={draft} setDraft={setDraft} />
      <Field label="Date limite de disponibilité" value={draft.availability} onChangeText={(availability) => setDraft({ ...draft, availability })} placeholder="Ex. disponible jusqu'au..." />
      <MediaCapture draft={draft} setDraft={setDraft} label="Ajouter des photos des matériaux" />
      <ContactFields draft={draft} setDraft={setDraft} required />
      <Checklist flow="materials" />
      <RequestPreview flow="materials" draft={draft} />
      <ErrorBox missing={missing} />
      <PrimaryButton loading={submitting} onPress={() => submit("materials")}>{submitting ? "Transmission..." : "Proposer à TVF"}</PrimaryButton>
    </ScrollView>
  );
}

function PropertyScreen({ draft, setDraft, submit, missing, submitting }) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ScreenTitle eyebrow="Propriétaire" title="Présenter un bien dormant">
        Une proposition de bien ouvre une pré-étude, pas une acceptation automatique.
      </ScreenTitle>
      <FlowGuide flow="property" />
      <PillPicker items={propertyTypes} selected={draft.category} onSelect={(category) => setDraft({ ...draft, category })} />
      <Field label="Adresse du bien" value={draft.address} onChangeText={(address) => setDraft({ ...draft, address })} placeholder="Adresse, commune..." />
      <LocationCapture draft={draft} setDraft={setDraft} />
      <Field label="État général" value={draft.condition} onChangeText={(condition) => setDraft({ ...draft, condition })} placeholder="Vacant, à rénover, inutilisé..." />
      <Field label="Objectif recherché" value={draft.objective} onChangeText={(objective) => setDraft({ ...draft, objective })} placeholder="Rendez-vous, étude, orientation..." multiline />
      <MediaCapture draft={draft} setDraft={setDraft} label="Ajouter des photos du bien" />
      <ContactFields draft={draft} setDraft={setDraft} required />
      <Notice>TVF peut demander la liste des pièces à fournir avant toute suite opérationnelle.</Notice>
      <Checklist flow="property" />
      <RequestPreview flow="property" draft={draft} />
      <ErrorBox missing={missing} />
      <PrimaryButton loading={submitting} onPress={() => submit("property")}>{submitting ? "Transmission..." : "Demander une étude"}</PrimaryButton>
    </ScrollView>
  );
}

function VolunteerScreen({ draft, setDraft, submit, missing, submitting }) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ScreenTitle eyebrow="Bénévolat" title="Proposer du temps ou une compétence">
        TVF pourra recontacter les personnes selon les besoins terrain et administratifs.
      </ScreenTitle>
      <FlowGuide flow="volunteer" />
      <Field label="Nom et prénom" value={draft.contactName} onChangeText={(contactName) => setDraft({ ...draft, contactName })} placeholder="Votre identité" />
      <Field label="E-mail" value={draft.email} onChangeText={(email) => setDraft({ ...draft, email })} placeholder="exemple@mail.fr" keyboardType="email-address" autoCapitalize="none" />
      <Field label="Téléphone" value={draft.phone} onChangeText={(phone) => setDraft({ ...draft, phone })} placeholder="Votre numéro" keyboardType="phone-pad" />
      <Field label="Compétences / disponibilités" value={draft.skills} onChangeText={(skills) => setDraft({ ...draft, skills })} placeholder="Repérage, logistique, administration, communication..." multiline />
      <Checklist flow="volunteer" />
      <ErrorBox missing={missing} />
      <PrimaryButton loading={submitting} onPress={() => submit("volunteer")}>{submitting ? "Transmission..." : "Transmettre à TVF"}</PrimaryButton>
    </ScrollView>
  );
}

function RequestsScreen({ submissionHistory = [], goTracking, openRequest }) {
  const sentCount = submissionHistory.filter((item) => item.syncMode === "supabase").length;
  const pendingCount = submissionHistory.length - sentCount;

  const shareReference = async (item) => {
    const message = `Demande TVF ${item.reference}
Type : ${item.label || "Demande TVF"}
Transmission : ${item.syncMode === "supabase" ? "transmise" : "à vérifier"}`;
    try {
      await Share.share({ message });
    } catch {
      Alert.alert("Partage indisponible", `Notez la référence : ${item.reference}`);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ScreenTitle eyebrow="Mes demandes" title="Demandes enregistrées sur ce téléphone">
        Retrouvez les références utiles pour échanger avec TVF et vérifier ce qui a bien été transmis.
      </ScreenTitle>
      <View style={styles.quickStats}>
        <View style={styles.statMini}><Text style={styles.statMiniValue}>{submissionHistory.length}</Text><Text style={styles.statMiniLabel}>demandes</Text></View>
        <View style={styles.statMini}><Text style={styles.statMiniValue}>{sentCount}</Text><Text style={styles.statMiniLabel}>transmises</Text></View>
        <View style={styles.statMini}><Text style={styles.statMiniValue}>{pendingCount}</Text><Text style={styles.statMiniLabel}>à vérifier</Text></View>
      </View>
      {submissionHistory.length ? (
        <View style={styles.stack}>
          {submissionHistory.map((item) => {
            const isSent = item.syncMode === "supabase";
            return (
              <View key={item.reference} style={styles.requestCard}>
                <View style={[styles.requestStatusIcon, isSent && styles.requestStatusIconReady]}>
                  <Ionicons name={isSent ? "cloud-done-outline" : "warning-outline"} size={19} color={isSent ? colors.white : colors.gold} />
                </View>
                <View style={styles.requestCardText}>
                  <Text style={styles.requestReference}>{item.reference}</Text>
                  <Text style={styles.requestLabel}>{item.label || "Demande TVF"}</Text>
                  <Text style={styles.requestMeta}>{item.categoryLabel || item.category || "Catégorie non renseignée"} · {item.address || "Localisation non renseignée"}</Text>
                  <Text style={[styles.requestSync, isSent && styles.requestSyncReady]}>{isSent ? "Transmise dans TVF OS" : "Transmission à vérifier"}</Text>
                  <View style={styles.requestActionsRow}>
                    <TouchableOpacity style={styles.requestShareButton} onPress={() => openRequest(item)} activeOpacity={0.82}>
                      <Ionicons name="eye-outline" size={16} color={colors.green} />
                      <Text style={styles.requestShareText}>Voir la fiche</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.requestShareButton} onPress={() => shareReference(item)} activeOpacity={0.82}>
                      <Ionicons name="share-social-outline" size={16} color={colors.green} />
                      <Text style={styles.requestShareText}>Partager la référence</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.trackingCard}>
          <Text style={styles.trackingTitle}>Aucune demande enregistrée</Text>
          <Text style={styles.summaryLine}>Les demandes envoyées depuis ce téléphone apparaîtront ici avec leur numéro TVF.</Text>
        </View>
      )}
      <PrimaryButton secondary icon="search-outline" onPress={goTracking}>Rechercher une demande</PrimaryButton>
    </ScrollView>
  );
}
function RequestDetailScreen({ request, goBack, goTracking }) {
  if (!request) {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenTitle eyebrow="Fiche demande" title="Demande introuvable">
          Revenez à la liste des demandes enregistrées sur ce téléphone.
        </ScreenTitle>
        <PrimaryButton onPress={goBack}>Retour aux demandes</PrimaryButton>
      </ScrollView>
    );
  }
  const isSent = request.syncMode === "supabase";
  const subject = encodeURIComponent(`Demande TVF ${request.reference || ""}`.trim());
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ScreenTitle eyebrow="Fiche demande" title={request.reference || "Demande TVF"}>
        Résumé opérationnel de la demande enregistrée depuis TVF Mobile.
      </ScreenTitle>
      <View style={[styles.syncBadge, isSent && styles.syncBadgeReady, !isSent && styles.syncBadgeError]}>
        <Ionicons name={isSent ? "cloud-done-outline" : "warning-outline"} size={16} color={colors.white} />
        <Text style={styles.syncBadgeTextReady}>{isSent ? "Transmise dans TVF OS" : "Transmission à vérifier"}</Text>
      </View>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Informations principales</Text>
        <Text style={styles.summaryLine}>Type : {request.label || "Non renseigné"}</Text>
        <Text style={styles.summaryLine}>Catégorie : {request.categoryLabel || request.category || "Non renseignée"}</Text>
        <Text style={styles.summaryLine}>Localisation : {request.address || "À compléter"}</Text>
        <Text style={styles.summaryLine}>Photo : {request.hasPhoto ? "jointe" : "non jointe"}</Text>
        <Text style={styles.summaryLine}>GPS : {request.hasCoordinates ? "enregistré" : "non renseigné"}</Text>
      </View>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Contact associé</Text>
        <Text style={styles.summaryLine}>E-mail : {request.email || "Non renseigné"}</Text>
        <Text style={styles.summaryLine}>Téléphone : {request.phone || "Non renseigné"}</Text>
      </View>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Message de transmission</Text>
        <Text style={styles.summaryLine}>{request.syncMessage || "Aucun message technique enregistré."}</Text>
      </View>
      <PrimaryButton secondary icon="share-social-outline" onPress={() => Share.share({ message: `Demande TVF ${request.reference}` })}>Partager la référence</PrimaryButton>
      <PrimaryButton secondary icon="mail-outline" onPress={() => Linking.openURL(`mailto:contact@territoiresvivantsfrance.fr?subject=${subject}`)}>Contacter TVF</PrimaryButton>
      <PrimaryButton secondary icon="search-outline" onPress={goTracking}>Ouvrir le suivi</PrimaryButton>
      <PrimaryButton onPress={goBack}>Retour aux demandes</PrimaryButton>
    </ScrollView>
  );
}
function TrackingScreen({ lastSubmission, submissionHistory = [] }) {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const normalizedQuery = query.trim().toLowerCase();
  const foundSubmission = submissionHistory.find((item) =>
    normalizedQuery &&
    [item.reference, item.email, item.phone].filter(Boolean).some((value) => String(value).toLowerCase().includes(normalizedQuery))
  );
  const visibleHistory = submissionHistory.slice(0, 5);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ScreenTitle eyebrow="Suivi" title="Retrouver une demande">
        Le numéro TVF permet de reprendre un échange et de rattacher la demande au dossier dans TVF OS.
      </ScreenTitle>
      <FlowGuide flow="tracking" />
      <Field label="E-mail, téléphone ou numéro TVF" value={query} onChangeText={setQuery} placeholder="TVF-SIG-000001" />
      <PrimaryButton secondary icon="refresh-outline" onPress={() => setSearched(true)}>Rechercher</PrimaryButton>
      {lastSubmission ? (
        <View style={styles.trackingCard}>
          <Text style={styles.trackingTitle}>Dernière demande sur ce téléphone</Text>
          <Text style={styles.summaryLine}>Numéro : {lastSubmission.reference}</Text>
          <Text style={styles.summaryLine}>Type : {lastSubmission.label}</Text>
          <Text style={styles.summaryLine}>Transmission : {lastSubmission.syncMode === "supabase" ? "enregistrée dans Supabase" : "locale ou à vérifier"}</Text>
        </View>
      ) : null}
      {visibleHistory.length ? (
        <View style={styles.trackingCard}>
          <Text style={styles.trackingTitle}>Historique de session</Text>
          {visibleHistory.map((item) => (
            <View key={item.reference} style={styles.historyRow}>
              <View style={styles.historyDot} />
              <View style={styles.historyText}>
                <Text style={styles.historyReference}>{item.reference}</Text>
                <Text style={styles.historyMeta}>{item.label || "Demande TVF"} · {item.syncMode === "supabase" ? "transmise" : "à vérifier"}</Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}
      {searched && normalizedQuery ? (
        <Notice>{foundSubmission ? "Demande retrouvée sur ce téléphone. Conservez ce numéro pour vos échanges avec TVF." : "Aucune demande locale ne correspond. Si elle a été transmise, contactez TVF avec votre e-mail ou votre numéro de dossier."}</Notice>
      ) : null}
      <View style={styles.trackingCard}>
        <Text style={styles.trackingTitle}>Chaîne de traitement TVF OS</Text>
        {statusSteps.map((step, index) => (
          <View key={step} style={styles.stepRow}>
            <View style={[styles.stepDot, index <= 1 && styles.stepDotActive]} />
            <Text style={[styles.stepText, index <= 1 && styles.stepTextActive]}>{step}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function DocumentsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ScreenTitle eyebrow="Documents" title="Préparer son dossier">
        Les documents publics utiles seront consultables depuis l'application et reliés aux dossiers TVF OS.
      </ScreenTitle>
      <View style={styles.stack}>
        {documentGroups.map((group) => (
          <View key={group.title} style={styles.groupCard}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            {group.items.map((item) => <Text key={item} style={styles.groupItem}>• {item}</Text>)}
          </View>
        ))}
        {documents.map((doc) => (
          <View key={doc.title} style={styles.documentCard}>
            <Ionicons name="document-text-outline" size={25} color={colors.green} />
            <View style={styles.documentText}>
              <Text style={styles.documentTitle}>{doc.title}</Text>
              <Text style={styles.documentSubtitle}>{doc.subtitle}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function ContactScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ScreenTitle eyebrow="Contact" title="Joindre Territoires Vivants France">
        Le contact rapide reste utile lorsqu'un utilisateur ne sait pas quel parcours choisir.
      </ScreenTitle>
      <View style={styles.stack}>
        {contactChannels.map((channel) => (
          <Card
            key={channel.title}
            icon={channel.icon}
            title={channel.title}
            subtitle={channel.subtitle}
            onPress={() => Linking.openURL(channel.url)}
          />
        ))}
        <Card icon="location-outline" title="Siège" subtitle="25 rue Élise Gervais, 42000 Saint-Étienne" />
      </View>
    </ScrollView>
  );
}

function ConfirmationScreen({ lastSubmission, goHome, goTracking }) {
  const data = lastSubmission || {};
  const subject = encodeURIComponent(`Demande TVF ${data.reference || ""}`.trim());
  const isSent = data.syncMode === "supabase";
  const isError = data.syncMode === "supabase-error";
  const statusTitle = isSent ? "Demande transmise" : isError ? "Transmission à vérifier" : "Demande préparée";
  const statusLabel = isSent ? "Supabase confirmé" : isError ? "Non transmis" : "Mode local";
  const statusIcon = isSent ? "cloud-done-outline" : isError ? "warning-outline" : "phone-portrait-outline";
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.confirmation}>
        <View style={[styles.confirmIcon, isError && styles.confirmIconWarning]}>
          <Ionicons name={isSent ? "checkmark" : statusIcon} size={42} color={colors.white} />
        </View>
        <Text style={styles.confirmTitle}>{statusTitle}</Text>
        <View style={[styles.syncBadge, isSent && styles.syncBadgeReady, isError && styles.syncBadgeError]}>
          <Ionicons name={statusIcon} size={16} color={isSent || isError ? colors.white : colors.green} />
          <Text style={[styles.syncBadgeText, (isSent || isError) && styles.syncBadgeTextReady]}>{statusLabel}</Text>
        </View>
        <Text style={styles.reference}>{data.reference}</Text>
        <Text style={styles.confirmText}>{data.syncMessage || "La demande est prête à être reprise dans TVF OS."}</Text>
        {!isSent ? <Notice>Pour apparaître dans TVF OS, la confirmation doit indiquer « Supabase confirmé ». Si ce n'est pas le cas, relancez Expo avec les variables Supabase puis renvoyez la demande.</Notice> : null}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Récapitulatif</Text>
          <Text style={styles.summaryLine}>Type : {data.label || "Non renseigné"}</Text>
          <Text style={styles.summaryLine}>Catégorie : {data.categoryLabel || data.category || "Non renseignée"}</Text>
          <Text style={styles.summaryLine}>Localisation : {data.address || "À compléter"}</Text>
          <Text style={styles.summaryLine}>Photo : {data.hasPhoto ? "jointe" : "non jointe"}</Text>
          <Text style={styles.summaryLine}>GPS : {data.hasCoordinates ? "enregistré" : "non renseigné"}</Text>
          <Text style={styles.summaryLine}>Transmission : {isSent ? "enregistrée dans Supabase" : isError ? "à renvoyer" : "locale uniquement"}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Suite prévue</Text>
          {nextSteps.map((step) => <Text key={step} style={styles.summaryLine}>• {step}</Text>)}
        </View>
        <PrimaryButton secondary icon="mail-outline" onPress={() => Linking.openURL(`mailto:contact@territoiresvivantsfrance.fr?subject=${subject}`)}>Contacter TVF avec ce numéro</PrimaryButton>
        <PrimaryButton secondary icon="search-outline" onPress={goTracking}>Voir le suivi</PrimaryButton>
        <PrimaryButton onPress={goHome}>Retour à l'accueil</PrimaryButton>
      </View>
    </ScrollView>
  );
}

function BottomNav({ screen, go }) {
  const items = [
    ["home", "Accueil", "home-outline"],
    ["signal", "Signaler", "alert-circle-outline"],
    ["requests", "Demandes", "file-tray-full-outline"],
    ["documents", "Docs", "document-text-outline"],
    ["contact", "Contact", "call-outline"]
  ];
  return (
    <View style={styles.bottomNav}>
      {items.map(([key, label, icon]) => {
        const active = screen === key;
        return (
          <TouchableOpacity key={key} style={styles.navItem} onPress={() => go(key)}>
            <Ionicons name={icon} size={21} color={active ? colors.green : colors.muted} />
            <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function AppShell() {
  const [screen, setScreen] = useState("home");
  const [history, setHistory] = useState(["home"]);
  const [draft, setDraft] = useState(initialDraft);
  const [lastSubmission, setLastSubmission] = useState(null);
  const [submissionHistory, setSubmissionHistory] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [missing, setMissing] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);

  useEffect(() => {
    let active = true;
    loadSubmissionHistory().then((items) => {
      if (!active) return;
      setSubmissionHistory(items);
      if (items.length) setLastSubmission(items[0]);
    });
    loadDraft().then((storedDraft) => {
      if (!active) return;
      if (hasDraftContent(storedDraft)) {
        setDraft(storedDraft);
        setDraftRestored(true);
      }
      setDraftReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (draftReady) saveDraft(draft);
  }, [draft, draftReady]);

  const openRequest = (request) => {
    setSelectedRequest(request);
    go("request-detail");
  };
  const go = (next, options = {}) => {
    setMissing([]);
    if (options.resetDraft) {
      setDraft(initialDraft);
      clearDraftStorage();
      setDraftRestored(false);
    }
    setScreen(next);
    setHistory((value) => [...value, next]);
  };

  const back = () => {
    setMissing([]);
    setHistory((value) => {
      if (value.length <= 1) {
        setScreen("home");
        return ["home"];
      }
      const nextHistory = value.slice(0, -1);
      setScreen(nextHistory[nextHistory.length - 1]);
      return nextHistory;
    });
  };

  const submit = async (flow) => {
    if (submitting) return;
    const missingFields = validateDraft(flow, draft);
    if (missingFields.length) {
      setMissing(missingFields);
      return;
    }

    setSubmitting(true);
    try {
      const reference = buildReference(flow);
      const categoryLabel = getCategoryLabel(flow, draft.category);
      const payload = buildRequestPayload({ flow, draft, reference, categoryLabel });
      const result = await submitMobileRequest(payload);
      if (!result.ok) {
        Alert.alert("Enregistrement non finalisé", result.message || "La demande reste préparée localement.");
      }
      const submission = {
        reference,
        label: flowLabels[flow],
        category: draft.category,
        categoryLabel,
        address: draft.address,
        email: draft.email,
        phone: draft.phone,
        hasPhoto: Boolean(draft.photoUri),
        hasCoordinates: Boolean(draft.latitude && draft.longitude),
        syncMode: result.mode,
        syncMessage: result.message,
        payload
      };
      setLastSubmission(submission);
      setSubmissionHistory((items) => {
        const next = [submission, ...items.filter((item) => item.reference !== reference)].slice(0, 8);
        saveSubmissionHistory(next);
        return next;
      });
      setDraft(initialDraft);
      clearDraftStorage();
      setMissing([]);
      go("confirmation");
    } finally {
      setSubmitting(false);
    }
  };
  const content = useMemo(() => {
    switch (screen) {
      case "signal":
        return <SignalScreen draft={draft} setDraft={setDraft} submit={submit} missing={missing} submitting={submitting} />;
      case "materials":
        return <MaterialsScreen draft={draft} setDraft={setDraft} submit={submit} missing={missing} submitting={submitting} />;
      case "property":
        return <PropertyScreen draft={draft} setDraft={setDraft} submit={submit} missing={missing} submitting={submitting} />;
      case "volunteer":
        return <VolunteerScreen draft={draft} setDraft={setDraft} submit={submit} missing={missing} submitting={submitting} />;
      case "requests":
        return <RequestsScreen submissionHistory={submissionHistory} goTracking={() => go("tracking")} openRequest={openRequest} />;
      case "tracking":
        return <TrackingScreen lastSubmission={lastSubmission} submissionHistory={submissionHistory} />;
      case "documents":
        return <DocumentsScreen />;
      case "contact":
        return <ContactScreen />;
      case "confirmation":
        return <ConfirmationScreen lastSubmission={lastSubmission} goHome={() => go("home")} goTracking={() => go("tracking")} />;
      case "home":
      default:
        return <HomeScreen go={go} draftRestored={draftRestored} />;
    }
  }, [screen, draft, lastSubmission, submissionHistory, selectedRequest, missing, submitting, draftReady, draftRestored]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.app}>
        <AppHeader screen={screen} onBack={back} onContact={() => go("contact")} />
        <View style={styles.main}>{content}</View>
        <BottomNav screen={screen} go={go} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppShell />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.cream },
  app: { flex: 1, backgroundColor: colors.cream },
  header: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  headerBrand: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerLogo: { width: 42, height: 42, borderRadius: 14 },
  headerTitle: { color: colors.blue, fontWeight: "800", fontSize: 15 },
  headerSubtitle: { color: colors.muted, fontWeight: "700", fontSize: 11 },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: colors.soft,
    alignItems: "center",
    justifyContent: "center"
  },
  headerButtonMuted: { opacity: 0.75 },
  main: { flex: 1 },
  content: { padding: 18, paddingBottom: 30 },
  screenTitle: { marginBottom: 16 },
  eyebrow: {
    color: colors.gold,
    fontSize: 12,
    letterSpacing: 1.1,
    textTransform: "uppercase",
    fontWeight: "800",
    marginBottom: 8
  },
  title: {
    color: colors.blue,
    fontSize: 29,
    lineHeight: 34,
    fontWeight: "800"
  },
  lead: { marginTop: 10, color: colors.muted, fontSize: 15, lineHeight: 22, fontWeight: "600" },
  logoPanel: {
    flexDirection: "row",
    gap: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    padding: 14,
    alignItems: "center",
    marginBottom: 14,
    ...shadow
  },
  logoLarge: { width: 92, height: 92, borderRadius: 28 },
  logoCopy: { flex: 1 },
  logoPanelTitle: { fontSize: 18, fontWeight: "800", color: colors.green, marginBottom: 4 },
  logoPanelText: { color: colors.muted, fontWeight: "600", lineHeight: 19 },
  configBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 14
  },
  configBannerReady: {
    borderColor: "#A8C7AA"
  },
  configIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: colors.soft,
    alignItems: "center",
    justifyContent: "center"
  },
  configIconReady: {
    backgroundColor: colors.green
  },
  configTextWrap: {
    flex: 1
  },
  configTitle: {
    color: colors.blue,
    fontWeight: "800",
    fontSize: 14
  },
  draftBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "#B7D2BA",
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 14,
    ...shadow
  },
  draftBannerIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: colors.green,
    alignItems: "center",
    justifyContent: "center"
  },
  draftBannerText: { flex: 1 },
  draftBannerTitle: { color: colors.green, fontWeight: "800", fontSize: 14.5 },
  draftBannerCopy: { color: colors.muted, fontWeight: "600", fontSize: 12.5, lineHeight: 18, marginTop: 2 },
  configText: {
    color: colors.muted,
    fontWeight: "600",
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 2
  },  quickStats: { flexDirection: "row", gap: 10, marginBottom: 14 },
  statMini: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12
  },
  statMiniValue: { color: colors.green, fontSize: 20, fontWeight: "800" },
  statMiniLabel: { color: colors.muted, fontSize: 11.5, fontWeight: "700", marginTop: 2 },
  stack: { gap: 12 },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    ...shadow
  },
  cardPrimary: { backgroundColor: colors.green, borderColor: colors.green },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: colors.soft,
    alignItems: "center",
    justifyContent: "center"
  },
  cardIconPrimary: { backgroundColor: colors.white },
  cardText: { flex: 1 },
  cardTitle: { color: colors.blue, fontSize: 15.5, fontWeight: "800", marginBottom: 3 },
  cardTitlePrimary: { color: colors.white },
  cardSubtitle: { color: colors.muted, fontSize: 12.5, lineHeight: 17, fontWeight: "600" },
  cardSubtitlePrimary: { color: "rgba(255,255,255,0.84)" },
  fieldGroup: { marginBottom: 12 },
  label: { color: colors.green, fontWeight: "800", marginBottom: 6, fontSize: 13 },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    minHeight: 50,
    color: colors.blue,
    fontWeight: "600",
    fontSize: 14.5
  },
  textArea: { minHeight: 96, textAlignVertical: "top" },
  pillGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 14 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 12
  },
  pillActive: { backgroundColor: colors.green, borderColor: colors.green },
  pillText: { color: colors.blue, fontWeight: "700", fontSize: 12.8 },
  pillTextActive: { color: colors.white },
  guideCard: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 14
  },
  guideStep: { flexDirection: "row", alignItems: "center", gap: 7 },
  guideNumber: {
    width: 24,
    height: 24,
    borderRadius: 99,
    backgroundColor: colors.green,
    alignItems: "center",
    justifyContent: "center"
  },
  guideNumberText: { color: colors.white, fontSize: 12, fontWeight: "800" },
  guideText: { color: colors.blue, fontSize: 12.5, fontWeight: "800" },
  mediaWrap: { marginBottom: 2 },  photoBox: {
    minHeight: 132,
    backgroundColor: colors.white,
    borderWidth: 1.2,
    borderColor: "#9EB7A2",
    borderStyle: "dashed",
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    marginBottom: 14
  },
  photoPreview: { width: "100%", height: 170, borderRadius: radius.md, marginTop: 12, resizeMode: "cover" },
  photoTitle: { color: colors.green, fontWeight: "800", marginTop: 8, fontSize: 15 },
  photoText: { color: colors.muted, fontWeight: "600", textAlign: "center", marginTop: 5, lineHeight: 18 },
  locationBox: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: 13,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 11
  },
  locationBoxActive: { backgroundColor: colors.green, borderColor: colors.green },
  locationTextWrap: { flex: 1 },
  locationTitle: { color: colors.green, fontWeight: "800", fontSize: 14 },
  locationTitleActive: { color: colors.white },
  locationText: { color: colors.muted, fontWeight: "600", fontSize: 12.5, marginTop: 2 },
  locationTextActive: { color: "rgba(255,255,255,0.82)" },
  contactCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 14
  },
  contactHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  contactHeaderText: { flex: 1 },
  contactTitle: { color: colors.blue, fontWeight: "800", fontSize: 15 },
  contactHint: { color: colors.muted, fontWeight: "600", fontSize: 12.5, marginTop: 2 },
  checklistCard: {
    backgroundColor: colors.soft,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 13,
    marginBottom: 14
  },
  checklistTitle: { color: colors.green, fontWeight: "800", fontSize: 14.5, marginBottom: 8 },
  checkRow: { flexDirection: "row", gap: 9, alignItems: "flex-start", paddingVertical: 3 },
  checkText: { flex: 1, color: colors.blue, fontWeight: "600", lineHeight: 19, fontSize: 12.8 },
  previewCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 13,
    marginBottom: 14
  },
  previewTitle: { color: colors.gold, fontWeight: "800", fontSize: 13.5, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 },
  previewLine: { color: colors.blue, fontWeight: "600", lineHeight: 21, fontSize: 13 },  notice: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: colors.soft,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
    marginBottom: 14
  },
  noticeText: { flex: 1, color: colors.blue, lineHeight: 19, fontWeight: "600", fontSize: 12.8 },
  errorBox: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#FFF3EF",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#F2C4B8",
    padding: 12,
    marginBottom: 14
  },
  errorText: { flex: 1, color: colors.danger, fontWeight: "700", lineHeight: 19, fontSize: 12.8 },
  primaryButton: {
    minHeight: 52,
    borderRadius: 999,
    backgroundColor: colors.green,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 18,
    marginTop: 2
  },
  secondaryButton: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.green },
  buttonDisabled: { opacity: 0.68 },
  primaryButtonText: { color: colors.white, fontSize: 15, fontWeight: "800" },
  secondaryButtonText: { color: colors.green },
  trackingCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 14,
    ...shadow
  },
  trackingTitle: { color: colors.blue, fontWeight: "800", fontSize: 16, marginBottom: 12 },
  historyRow: { flexDirection: "row", gap: 10, alignItems: "flex-start", paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.line },
  historyDot: { width: 10, height: 10, borderRadius: 99, backgroundColor: colors.green, marginTop: 5 },
  historyText: { flex: 1 },
  historyReference: { color: colors.blue, fontWeight: "800", fontSize: 13.5 },
  historyMeta: { color: colors.muted, fontWeight: "600", fontSize: 12.5, marginTop: 2 },
  requestCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    ...shadow
  },
  requestStatusIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: "#FFF7E4",
    alignItems: "center",
    justifyContent: "center"
  },
  requestStatusIconReady: { backgroundColor: colors.green },
  requestCardText: { flex: 1 },
  requestReference: { color: colors.gold, fontSize: 13, fontWeight: "800", marginBottom: 3 },
  requestLabel: { color: colors.blue, fontSize: 15.5, fontWeight: "800", marginBottom: 3 },
  requestMeta: { color: colors.muted, fontSize: 12.5, lineHeight: 18, fontWeight: "600" },
  requestSync: { color: colors.gold, fontSize: 12.5, fontWeight: "800", marginTop: 7 },
  requestSyncReady: { color: colors.green },
  requestActionsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  requestShareButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.soft
  },
  requestShareText: { color: colors.green, fontWeight: "800", fontSize: 12.5 },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 7 },
  stepDot: { width: 13, height: 13, borderRadius: 99, backgroundColor: colors.line },
  stepDotActive: { backgroundColor: colors.green },
  stepText: { color: colors.muted, fontWeight: "700" },
  stepTextActive: { color: colors.blue },
  groupCard: {
    backgroundColor: colors.soft,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: 14
  },
  groupTitle: { color: colors.green, fontWeight: "800", fontSize: 15, marginBottom: 8 },
  groupItem: { color: colors.blue, fontWeight: "600", lineHeight: 21 },
  documentCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    flexDirection: "row",
    gap: 12,
    alignItems: "center"
  },
  documentText: { flex: 1 },
  documentTitle: { color: colors.blue, fontWeight: "800", fontSize: 15 },
  documentSubtitle: { color: colors.muted, fontWeight: "600", lineHeight: 18, marginTop: 3 },
  confirmation: { minHeight: 520, justifyContent: "center", gap: 14 },
  confirmIcon: {
    width: 86,
    height: 86,
    borderRadius: 32,
    backgroundColor: colors.green,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 6
  },
  confirmIconWarning: { backgroundColor: colors.gold },
  confirmTitle: { color: colors.blue, fontSize: 26, lineHeight: 30, fontWeight: "800", textAlign: "center" },
  syncBadge: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: colors.soft,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 7
  },
  syncBadgeReady: { backgroundColor: colors.green, borderColor: colors.green },
  syncBadgeError: { backgroundColor: colors.danger, borderColor: colors.danger },
  syncBadgeText: { color: colors.green, fontWeight: "800", fontSize: 12.5 },
  syncBadgeTextReady: { color: colors.white },
  reference: { color: colors.gold, fontSize: 16, fontWeight: "800", textAlign: "center" },
  confirmText: { color: colors.muted, fontSize: 15, lineHeight: 22, fontWeight: "600", textAlign: "center" },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14
  },
  summaryTitle: { color: colors.green, fontWeight: "800", fontSize: 15, marginBottom: 7 },
  summaryLine: { color: colors.blue, fontWeight: "600", lineHeight: 21 },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 8,
    paddingBottom: 8
  },
  navItem: { flex: 1, alignItems: "center", gap: 3 },
  navLabel: { color: colors.muted, fontSize: 11, fontWeight: "800" },
  navLabelActive: { color: colors.green }
});