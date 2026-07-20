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
  fieldTestPlan,
  flowGuides,
  flowLabels,
  homeActions,
  materialCategories,
  nextSteps,
  releaseReadiness,
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
function isValidEmail(value) {
  const text = String(value || "").trim();
  if (!text) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
}

function isValidPhone(value) {
  const text = String(value || "").trim();
  if (!text) return true;
  const digits = text.replace(/\D/g, "");
  return digits.length >= 10;
}
function buildMapsUrl(request) {
  const payloadLocation = request?.payload?.location || {};
  const latitude = request?.latitude || payloadLocation.latitude;
  const longitude = request?.longitude || payloadLocation.longitude;
  if (latitude && longitude) return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  const address = request?.address || payloadLocation.rawAddress;
  if (address) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  return null;
}

function requestCanBeRetried(request) {
  return Boolean(request?.payload && request?.syncMode !== "supabase");
}

function formatShortDate(value) {
  if (!value) return "Date non renseignée";
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(value));
  } catch {
    return "Date non renseignée";
  }
}

function getPriorityLabel(priority) {
  const normalized = String(priority || "normale").toLowerCase();
  if (normalized === "haute") return "Priorité haute";
  if (normalized === "basse") return "Priorité basse";
  return "Priorité normale";
}

function getLocalStatusLabel(request) {
  if (request?.syncMode === "supabase") return "Reçue dans TVF OS";
  if (request?.syncMode === "supabase-error") return "À renvoyer";
  return "Enregistrée localement";
}

function getRequestFlow(request) {
  return request?.flow || request?.payload?.flow || "signal";
}

function getFlowNextAction(flow) {
  const actions = {
    signal: "Vérifier la localisation et qualifier la situation observée.",
    materials: "Contrôler la nature, la quantité et les conditions de récupération.",
    property: "Préparer une pré-étude du bien et les pièces propriétaire.",
    volunteer: "Qualifier le profil et rattacher la personne aux besoins TVF."
  };
  return actions[flow] || actions.signal;
}

function getActionPlanItems(request) {
  const flow = getRequestFlow(request);
  const common = ["Conserver le numéro TVF et le communiquer dans chaque échange."];
  const media = request?.hasPhoto
    ? "Vérifier que les photos illustrent clairement la situation."
    : "Ajouter une photo si elle peut être prise légalement.";
  const location = request?.hasCoordinates
    ? "La position GPS est disponible pour faciliter la localisation."
    : "Compléter l'adresse avec un repère précis si besoin.";
  const byFlow = {
    signal: [media, location, "Décrire uniquement des faits observables avant qualification TVF."],
    materials: [media, "Préciser quantité, état, dimensions et délai de disponibilité.", "Préparer les conditions de retrait ou de visite du stock."],
    property: [media, location, "Préparer titre de propriété, situation d'occupation et objectif recherché."],
    volunteer: ["Préciser disponibilités, compétences et zone d'intervention.", "Indiquer le canal préféré pour être recontacté.", "Rattacher le profil aux besoins terrain ou administratifs."]
  };
  return [...common, ...(byFlow[flow] || byFlow.signal), getFlowNextAction(flow)];
}

function validateDraft(flow, draft) {
  const required = requiredFieldsByFlow[flow] || [];
  const missing = required.filter((field) => !String(draft[field] || "").trim());
  if (["materials", "property"].includes(flow) && !draft.email.trim() && !draft.phone.trim()) {
    missing.push("contactMethod");
  }
  if (!isValidEmail(draft.email)) missing.push("emailFormat");
  if (!isValidPhone(draft.phone)) missing.push("phoneFormat");
  return [...new Set(missing)];
}

function completionForFlow(flow, draft) {
  const required = [...(requiredFieldsByFlow[flow] || [])];
  if (["materials", "property"].includes(flow)) required.push("contactMethod");
  const uniqueRequired = [...new Set(required)];
  const completed = uniqueRequired.filter((field) => {
    if (field === "contactMethod") return Boolean(draft.email.trim() || draft.phone.trim());
    return Boolean(String(draft[field] || "").trim());
  }).length;
  return {
    completed,
    total: uniqueRequired.length,
    percent: uniqueRequired.length ? Math.round((completed / uniqueRequired.length) * 100) : 100
  };
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

function Field({ label, value = "", onChangeText = () => {}, placeholder, multiline, keyboardType, autoCapitalize = "sentences", required, hint }) {
  return (
    <View style={styles.fieldGroup}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {required ? <Text style={styles.requiredTag}>requis</Text> : null}
      </View>
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
      {hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
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
  const photos = Array.isArray(draft.photos) ? draft.photos : [];
  const photoCount = photos.length || (draft.photoUri ? 1 : 0);

  const applyPhotos = (nextPhotos) => {
    const limited = nextPhotos.slice(0, 4);
    const primary = limited[0] || null;
    setDraft({
      ...draft,
      photos: limited,
      photoUri: primary?.uri || "",
      photoFileName: primary?.fileName || ""
    });
  };

  const saveAssets = (assets) => {
    const incoming = (assets || [])
      .filter((asset) => asset?.uri)
      .map((asset, index) => ({
        uri: asset.uri,
        fileName: asset.fileName || `photo-tvf-mobile-${Date.now()}-${index + 1}.jpg`
      }));
    if (!incoming.length) return;
    applyPhotos([...photos, ...incoming]);
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
        allowsMultipleSelection: true,
        selectionLimit: Math.max(1, 4 - photoCount),
        quality: 0.75
      });
      if (!result.canceled && result.assets?.length) saveAssets(result.assets);
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
      if (!result.canceled && result.assets?.length) saveAssets(result.assets);
    } finally {
      setBusy(false);
    }
  };

  const choosePhotoSource = () => {
    if (photoCount >= 4) {
      Alert.alert("Limite atteinte", "Vous pouvez joindre jusqu'à 4 photos par demande.");
      return;
    }
    Alert.alert("Ajouter une photo", "Choisissez la source de l'image.", [
      { text: "Appareil photo", onPress: openCamera },
      { text: "Photothèque", onPress: openLibrary },
      { text: "Annuler", style: "cancel" }
    ]);
  };

  const removePhoto = (index) => {
    applyPhotos(photos.filter((_, photoIndex) => photoIndex !== index));
  };

  const clearPhotos = () => {
    setDraft({ ...draft, photoUri: "", photoFileName: "", photos: [] });
  };

  return (
    <View style={styles.mediaWrap}>
      <TouchableOpacity style={styles.photoBox} activeOpacity={0.82} onPress={choosePhotoSource}>
        {busy ? <ActivityIndicator color={colors.green} /> : <Ionicons name="camera-outline" size={30} color={colors.green} />}
        <Text style={styles.photoTitle}>{photoCount ? `${photoCount} photo${photoCount > 1 ? "s" : ""} ajoutée${photoCount > 1 ? "s" : ""}` : label}</Text>
        {draft.photoUri ? <Image source={{ uri: draft.photoUri }} style={styles.photoPreview} /> : null}
        <Text style={styles.photoText}>{photoCount ? "La première photo sert d'aperçu. Les photos seront jointes à la demande TVF OS." : "Prendre une photo ou choisir une image existante."}</Text>
      </TouchableOpacity>
      {photos.length ? (
        <View style={styles.photoStrip}>
          {photos.map((photo, index) => (
            <TouchableOpacity key={`${photo.uri}-${index}`} style={styles.photoThumbWrap} onPress={() => removePhoto(index)} activeOpacity={0.84}>
              <Image source={{ uri: photo.uri }} style={styles.photoThumb} />
              <View style={styles.photoRemoveBadge}><Ionicons name="close" size={13} color={colors.white} /></View>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
      {photoCount ? <PrimaryButton secondary icon="trash-outline" onPress={clearPhotos}>Retirer les photos</PrimaryButton> : null}
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
      <View style={styles.errorHeader}>
        <Ionicons name="alert-circle-outline" size={20} color={colors.danger} />
        <Text style={styles.errorTitle}>Informations à compléter</Text>
      </View>
      {missing.map((field) => (
        <View key={field} style={styles.errorRow}>
          <View style={styles.errorDot} />
          <Text style={styles.errorText}>{fieldLabels[field] || field}</Text>
        </View>
      ))}
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

function CompletionMeter({ flow, draft }) {
  const completion = completionForFlow(flow, draft);
  if (!completion.total) return null;
  return (
    <View style={styles.completionCard}>
      <View style={styles.completionHeader}>
        <View>
          <Text style={styles.completionTitle}>Qualité de la saisie</Text>
          <Text style={styles.completionText}>{completion.completed}/{completion.total} informations essentielles complétées</Text>
        </View>
        <Text style={styles.completionPercent}>{completion.percent}%</Text>
      </View>
      <View style={styles.completionTrack}>
        <View style={[styles.completionFill, { width: `${completion.percent}%` }]} />
      </View>
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

function NextStepsTimeline() {
  return (
    <View style={styles.timelineCard}>
      <Text style={styles.timelineTitle}>Suite prévue</Text>
      {nextSteps.map((step, index) => (
        <View key={step} style={styles.timelineRow}>
          <View style={styles.timelineMarker}><Text style={styles.timelineMarkerText}>{index + 1}</Text></View>
          <View style={styles.timelineTextWrap}>
            <Text style={styles.timelineStep}>{step}</Text>
            <Text style={styles.timelineHint}>{index === 0 ? "La demande arrive dans le module Demandes reçues." : index === 1 ? "TVF vérifie la nature, la localisation et les informations utiles." : index === 2 ? "Un complément pourra être demandé si le dossier doit être instruit." : "La demande est classée, orientée ou transformée en dossier."}</Text>
          </View>
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
      <Field required={required} label="Nom et prénom" value={draft.contactName} onChangeText={(contactName) => setDraft({ ...draft, contactName })} placeholder="Votre identité" />
      {required ? <Text style={styles.contactRequiredNote}>Indiquez au moins un moyen de contact : e-mail ou téléphone.</Text> : null}
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
      <Text style={styles.previewLine}>Photos : {draft.photoUri ? `${Array.isArray(draft.photos) && draft.photos.length ? draft.photos.length : 1} jointe(s)` : "non jointes"}</Text>
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
function HomeScreen({ go, draftRestored, dismissDraft }) {
  const fieldActions = homeActions.filter((action) => ["signal", "materials", "property", "volunteer"].includes(action.key));
  const supportActions = homeActions.filter((action) => ["requests", "tracking"].includes(action.key));

  const renderAction = (action) => (
    <Card
      key={action.key}
      icon={action.icon}
      title={action.title}
      subtitle={action.subtitle}
      primary={action.primary}
      onPress={() => go(action.key, { resetDraft: ["signal", "materials", "property", "volunteer"].includes(action.key) })}
    />
  );

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ScreenTitle eyebrow="Préversion terrain" title="Signaler, localiser, transmettre à TVF">
        TVF Mobile sert à créer une première demande exploitable : lieu vacant, matériaux disponibles, bien proposé ou candidature bénévole.
      </ScreenTitle>
      <View style={styles.logoPanel}>
        <Image source={logo} style={styles.logoLarge} />
        <View style={styles.logoCopy}>
          <Text style={styles.logoPanelTitle}>Pensée pour le terrain</Text>
          <Text style={styles.logoPanelText}>Chaque saisie crée une référence, conserve une trace locale et peut remonter dans TVF OS.</Text>
        </View>
      </View>
      <ConfigBanner />
      {draftRestored ? (
        <View style={styles.draftBanner}>
          <TouchableOpacity style={styles.draftResumeArea} onPress={() => go("signal")} activeOpacity={0.86}>
            <View style={styles.draftBannerIcon}>
              <Ionicons name="create-outline" size={20} color={colors.white} />
            </View>
            <View style={styles.draftBannerText}>
              <Text style={styles.draftBannerTitle}>Brouillon restauré</Text>
              <Text style={styles.draftBannerCopy}>Une demande commencée a été retrouvée sur ce téléphone.</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.green} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.draftClearButton} onPress={dismissDraft} activeOpacity={0.82}>
            <Ionicons name="trash-outline" size={16} color={colors.muted} />
            <Text style={styles.draftClearText}>Supprimer</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      <View style={styles.quickStats}>
        <View style={styles.statMini}><Text style={styles.statMiniValue}>1</Text><Text style={styles.statMiniLabel}>référence TVF</Text></View>
        <View style={styles.statMini}><Text style={styles.statMiniValue}>3</Text><Text style={styles.statMiniLabel}>preuves utiles</Text></View>
        <View style={styles.statMini}><Text style={styles.statMiniValue}>OS</Text><Text style={styles.statMiniLabel}>suivi interne</Text></View>
      </View>
      <View style={styles.homeFlowCard}>
        <View style={styles.homeFlowStep}><Text style={styles.homeFlowNumber}>1</Text><Text style={styles.homeFlowText}>Choisir le bon parcours</Text></View>
        <View style={styles.homeFlowStep}><Text style={styles.homeFlowNumber}>2</Text><Text style={styles.homeFlowText}>Ajouter adresse, photo et contact</Text></View>
        <View style={styles.homeFlowStep}><Text style={styles.homeFlowNumber}>3</Text><Text style={styles.homeFlowText}>Transmettre vers TVF OS</Text></View>
      </View>
      <View style={styles.actionSection}>
        <View style={styles.actionSectionHeader}>
          <Text style={styles.actionSectionTitle}>Agir sur le terrain</Text>
          <Text style={styles.actionSectionSubtitle}>Créer une demande nouvelle.</Text>
        </View>
        <View style={styles.stack}>{fieldActions.map(renderAction)}</View>
      </View>
      <View style={styles.actionSection}>
        <View style={styles.actionSectionHeader}>
          <Text style={styles.actionSectionTitle}>Suivre et préparer</Text>
          <Text style={styles.actionSectionSubtitle}>Retrouver une référence ou préparer les pièces utiles.</Text>
        </View>
        <View style={styles.stack}>{supportActions.map(renderAction)}</View>
        <Card icon="document-text-outline" title="Documents utiles" subtitle="Listes de pièces et supports de préparation." onPress={() => go("documents")} />
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
      <Field required hint="Indiquez une adresse complete ou un repere assez precis pour localiser le lieu." label="Adresse ou repère" value={draft.address} onChangeText={(address) => setDraft({ ...draft, address })} placeholder="Rue, commune, quartier..." />
      <Field required hint="Decrivez uniquement des faits observables : etat, acces visible, risque eventuel." label="Description courte" value={draft.description} onChangeText={(description) => setDraft({ ...draft, description })} placeholder="Que faut-il savoir ?" multiline />
      <ContactFields draft={draft} setDraft={setDraft} />
      <Notice>Ne prenez pas de photo en entrant dans une propriété privée sans autorisation.</Notice>
      <Checklist flow="signal" />
      <CompletionMeter flow="signal" draft={draft} />
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
      <Field required hint="Donnez une estimation simple : nombre, surface, volume ou dimensions." label="Quantité / dimensions" value={draft.quantity} onChangeText={(quantity) => setDraft({ ...draft, quantity })} placeholder="Ex. 12 portes, 30 m² de carrelage..." />
      <Field required hint="Precisez si la ressource est neuve, reutilisable, a verifier ou a deposer." label="État général" value={draft.condition} onChangeText={(condition) => setDraft({ ...draft, condition })} placeholder="Neuf, bon état, à vérifier..." />
      <Field required hint="TVF doit savoir ou se trouvent les materiaux avant toute orientation." label="Lieu de stockage" value={draft.address} onChangeText={(address) => setDraft({ ...draft, address })} placeholder="Adresse ou commune" />
      <LocationCapture draft={draft} setDraft={setDraft} />
      <Field label="Date limite de disponibilité" value={draft.availability} onChangeText={(availability) => setDraft({ ...draft, availability })} placeholder="Ex. disponible jusqu'au..." />
      <MediaCapture draft={draft} setDraft={setDraft} label="Ajouter des photos des matériaux" />
      <ContactFields draft={draft} setDraft={setDraft} required />
      <Checklist flow="materials" />
      <CompletionMeter flow="materials" draft={draft} />
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
      <Field required hint="Adresse utile pour rattacher la proposition au territoire et preparer la pre-etude." label="Adresse du bien" value={draft.address} onChangeText={(address) => setDraft({ ...draft, address })} placeholder="Adresse, commune..." />
      <LocationCapture draft={draft} setDraft={setDraft} />
      <Field required hint="Indiquez etat visible, niveau usage et limites connues." label="État général" value={draft.condition} onChangeText={(condition) => setDraft({ ...draft, condition })} placeholder="Vacant, à rénover, inutilisé..." />
      <Field required hint="Expliquez votre attente : rendez-vous, orientation, pre-etude ou mise en relation." label="Objectif recherché" value={draft.objective} onChangeText={(objective) => setDraft({ ...draft, objective })} placeholder="Rendez-vous, étude, orientation..." multiline />
      <MediaCapture draft={draft} setDraft={setDraft} label="Ajouter des photos du bien" />
      <ContactFields draft={draft} setDraft={setDraft} required />
      <Notice>TVF peut demander la liste des pièces à fournir avant toute suite opérationnelle.</Notice>
      <Checklist flow="property" />
      <CompletionMeter flow="property" draft={draft} />
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
      <Field required label="Nom et prénom" value={draft.contactName} onChangeText={(contactName) => setDraft({ ...draft, contactName })} placeholder="Votre identité" />
      <Field required label="E-mail" value={draft.email} onChangeText={(email) => setDraft({ ...draft, email })} placeholder="exemple@mail.fr" keyboardType="email-address" autoCapitalize="none" />
      <Field label="Téléphone" value={draft.phone} onChangeText={(phone) => setDraft({ ...draft, phone })} placeholder="Votre numéro" keyboardType="phone-pad" />
      <Field required hint="Indiquez vos disponibilites, competences ou le type aide possible." label="Compétences / disponibilités" value={draft.skills} onChangeText={(skills) => setDraft({ ...draft, skills })} placeholder="Repérage, logistique, administration, communication..." multiline />
      <Checklist flow="volunteer" />
      <CompletionMeter flow="volunteer" draft={draft} />
      <ErrorBox missing={missing} />
      <PrimaryButton loading={submitting} onPress={() => submit("volunteer")}>{submitting ? "Transmission..." : "Transmettre à TVF"}</PrimaryButton>
    </ScrollView>
  );
}

function RequestsScreen({ submissionHistory = [], goTracking, openRequest, retryRequest, retryingReference }) {
  const sentCount = submissionHistory.filter((item) => item.syncMode === "supabase").length;
  const pendingCount = submissionHistory.length - sentCount;

  const shareReference = async (item) => {
    const message = `Demande TVF ${item.reference}
Type : ${item.label || "Demande TVF"}
Transmission : ${item.syncMode === "supabase" ? "transmise" : "à finaliser"}`;
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
        <View style={styles.statMini}><Text style={styles.statMiniValue}>{pendingCount}</Text><Text style={styles.statMiniLabel}>à finaliser</Text></View>
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
                  <View style={styles.requestBadgeRow}>
                    <Text style={[styles.requestBadge, isSent && styles.requestBadgeReady]}>{getLocalStatusLabel(item)}</Text>
                    <Text style={[styles.requestBadge, item.priority === "haute" && styles.requestBadgeHigh]}>{getPriorityLabel(item.priority)}</Text>
                  </View>
                  <Text style={styles.requestSync}>{formatShortDate(item.createdAt || item.updatedAt)}</Text>
                  <View style={styles.requestActionsRow}>
                    <TouchableOpacity style={styles.requestShareButton} onPress={() => openRequest(item)} activeOpacity={0.82}>
                      <Ionicons name="eye-outline" size={16} color={colors.green} />
                      <Text style={styles.requestShareText}>Voir la fiche</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.requestShareButton} onPress={() => shareReference(item)} activeOpacity={0.82}>
                      <Ionicons name="share-social-outline" size={16} color={colors.green} />
                      <Text style={styles.requestShareText}>Partager la référence</Text>
                    </TouchableOpacity>
                    {!isSent ? (
                      <TouchableOpacity style={styles.requestShareButton} onPress={() => retryRequest(item)} activeOpacity={0.82}>
                        <Ionicons name="cloud-upload-outline" size={16} color={colors.green} />
                        <Text style={styles.requestShareText}>{retryingReference === item.reference ? "Envoi..." : "Renvoyer"}</Text>
                      </TouchableOpacity>
                    ) : null}
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
function RequestActionPlan({ request }) {
  const items = getActionPlanItems(request);
  const flow = getRequestFlow(request);
  return (
    <View style={styles.actionPlanCard}>
      <View style={styles.actionPlanHeader}>
        <Ionicons name="clipboard-outline" size={20} color={colors.green} />
        <View style={styles.actionPlanHeaderText}>
          <Text style={styles.actionPlanTitle}>À préparer pour TVF</Text>
          <Text style={styles.actionPlanSubtitle}>{flowLabels[flow] || "Demande TVF"}</Text>
        </View>
      </View>
      {items.map((item) => (
        <View key={item} style={styles.actionPlanRow}>
          <Ionicons name="checkmark-circle-outline" size={17} color={colors.green2} />
          <Text style={styles.actionPlanText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function RequestDetailScreen({ request, goBack, goTracking, retryRequest, retryingReference }) {
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
  const mapsUrl = buildMapsUrl(request);
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ScreenTitle eyebrow="Fiche demande" title={request.reference || "Demande TVF"}>
        Résumé opérationnel de la demande enregistrée depuis TVF Mobile.
      </ScreenTitle>
      <View style={[styles.syncBadge, isSent && styles.syncBadgeReady, !isSent && styles.syncBadgeError]}>
        <Ionicons name={isSent ? "cloud-done-outline" : "warning-outline"} size={16} color={colors.white} />
        <Text style={styles.syncBadgeTextReady}>{isSent ? "Transmise dans TVF OS" : "Transmission à finaliser"}</Text>
      </View>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Informations principales</Text>
        <Text style={styles.summaryLine}>Type : {request.label || "Non renseigné"}</Text>
        <Text style={styles.summaryLine}>Parcours : {flowLabels[getRequestFlow(request)] || "Demande TVF"}</Text>
        <Text style={styles.summaryLine}>Catégorie : {request.categoryLabel || request.category || "Non renseignée"}</Text>
        <Text style={styles.summaryLine}>Localisation : {request.address || "À compléter"}</Text>
        <Text style={styles.summaryLine}>Statut : {getLocalStatusLabel(request)}</Text>
        <Text style={styles.summaryLine}>Priorité : {getPriorityLabel(request.priority)}</Text>
        <Text style={styles.summaryLine}>Date : {formatShortDate(request.createdAt || request.updatedAt)}</Text>
        <Text style={styles.summaryLine}>Photos : {request.photoCount ? `${request.photoCount} jointe(s)` : request.hasPhoto ? "1 jointe" : "non jointes"}</Text>
        <Text style={styles.summaryLine}>GPS : {request.hasCoordinates ? "enregistré" : "non renseigné"}</Text>
      </View>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Contact associé</Text>
        <Text style={styles.summaryLine}>E-mail : {request.email || "Non renseigné"}</Text>
        <Text style={styles.summaryLine}>Téléphone : {request.phone || "Non renseigné"}</Text>
      </View>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Message de transmission</Text>
        <Text style={styles.summaryLine}>{request.syncMessage || "Aucun message complémentaire enregistré."}</Text>
      </View>
      <RequestActionPlan request={request} />
      {requestCanBeRetried(request) ? (
        <PrimaryButton icon="cloud-upload-outline" loading={retryingReference === request.reference} onPress={() => retryRequest(request)}>
          {retryingReference === request.reference ? "Renvoi en cours..." : "Renvoyer vers TVF OS"}
        </PrimaryButton>
      ) : null}
      {mapsUrl ? <PrimaryButton secondary icon="map-outline" onPress={() => Linking.openURL(mapsUrl)}>Ouvrir la localisation</PrimaryButton> : null}
      <PrimaryButton secondary icon="share-social-outline" onPress={() => Share.share({ message: `Demande TVF ${request.reference}` })}>Partager la référence</PrimaryButton>
      <PrimaryButton secondary icon="mail-outline" onPress={() => Linking.openURL(`mailto:contact@territoiresvivantsfrance.fr?subject=${subject}`)}>Contacter TVF</PrimaryButton>
      <PrimaryButton secondary icon="search-outline" onPress={goTracking}>Ouvrir le suivi</PrimaryButton>
      <PrimaryButton onPress={goBack}>Retour aux demandes</PrimaryButton>
    </ScrollView>
  );
}
function TrackingScreen({ lastSubmission, submissionHistory = [], openRequest }) {
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
          <Text style={styles.summaryLine}>Statut : {getLocalStatusLabel(lastSubmission)}</Text>
          <Text style={styles.summaryLine}>Date : {formatShortDate(lastSubmission.createdAt || lastSubmission.updatedAt)}</Text>
          <Text style={styles.summaryLine}>Transmission : {lastSubmission.syncMode === "supabase" ? "transmise vers TVF OS" : "locale ou à finaliser"}</Text>
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
                <Text style={styles.historyMeta}>{item.label || "Demande TVF"} · {getLocalStatusLabel(item)} · {formatShortDate(item.createdAt || item.updatedAt)}</Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}
      {searched && normalizedQuery ? (
        foundSubmission ? (
          <View style={styles.foundRequestCard}>
            <View style={styles.foundRequestHead}>
              <Ionicons name="search-circle-outline" size={24} color={colors.green} />
              <View style={styles.foundRequestText}>
                <Text style={styles.foundRequestTitle}>Demande retrouvée</Text>
                <Text style={styles.foundRequestMeta}>{foundSubmission.reference} · {foundSubmission.label || "Demande TVF"}</Text>
              </View>
            </View>
            <PrimaryButton secondary icon="eye-outline" onPress={() => openRequest?.(foundSubmission)}>Ouvrir la fiche</PrimaryButton>
          </View>
        ) : (
          <Notice>Aucune demande locale ne correspond. Si elle a été transmise, contactez TVF avec votre e-mail ou votre numéro de dossier.</Notice>
        )
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
  const preparationTracks = [
    {
      title: "Propriétaire ou bien vacant",
      icon: "home-outline",
      items: ["Adresse précise du bien", "Photos extérieures et intérieures si autorisées", "Situation d'occupation", "Objectif recherché"]
    },
    {
      title: "Matériaux ou équipements",
      icon: "cube-outline",
      items: ["Nature des matériaux", "Quantité ou dimensions", "État général", "Lieu et délai de disponibilité"]
    },
    {
      title: "Signalement de terrain",
      icon: "location-outline",
      items: ["Adresse ou repère fiable", "Type de situation", "Description factuelle", "Photo prise légalement"]
    }
  ];

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ScreenTitle eyebrow="Documents" title="Préparer une demande solide">
        Cette bibliothèque aide à réunir les premières informations avant instruction. Chaque situation reste étudiée par TVF avant toute suite opérationnelle.
      </ScreenTitle>
      <View style={styles.documentIntroCard}>
        <Ionicons name="folder-open-outline" size={26} color={colors.green} />
        <View style={styles.documentIntroText}>
          <Text style={styles.documentIntroTitle}>Objectif terrain</Text>
          <Text style={styles.documentIntroCopy}>Arriver au premier échange avec les bonnes pièces, une localisation claire et une demande compréhensible.</Text>
        </View>
      </View>
      <View style={styles.stack}>
        {preparationTracks.map((track) => (
          <View key={track.title} style={styles.preparationCard}>
            <View style={styles.preparationHead}>
              <View style={styles.preparationIcon}><Ionicons name={track.icon} size={20} color={colors.white} /></View>
              <Text style={styles.preparationTitle}>{track.title}</Text>
            </View>
            {track.items.map((item) => (
              <View key={item} style={styles.preparationRow}>
                <Ionicons name="checkmark-circle-outline" size={17} color={colors.green2} />
                <Text style={styles.preparationText}>{item}</Text>
              </View>
            ))}
          </View>
        ))}
        <View style={styles.groupCard}>
          <Text style={styles.groupTitle}>Recette terrain Expo Go</Text>
          {fieldTestPlan.map((track) => (
            <View key={track.title} style={styles.testTrackCard}>
              <View style={styles.testTrackHead}>
                <Ionicons name={track.icon} size={17} color={colors.green} />
                <Text style={styles.testTrackTitle}>{track.title}</Text>
              </View>
              {track.items.map((item) => (
                <View key={item} style={styles.groupItemRow}>
                  <Ionicons name="checkmark-circle-outline" size={16} color={colors.green2} />
                  <Text style={styles.groupItem}>{item}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
        <View style={styles.groupCard}>
          <Text style={styles.groupTitle}>Préparation publication</Text>
          {releaseReadiness.map((track) => (
            <View key={track.title} style={styles.testTrackCard}>
              <View style={styles.testTrackHead}>
                <Ionicons name={track.icon} size={17} color={colors.green} />
                <Text style={styles.testTrackTitle}>{track.title}</Text>
              </View>
              {track.items.map((item) => (
                <View key={item} style={styles.groupItemRow}>
                  <Ionicons name="ellipse-outline" size={14} color={colors.green2} />
                  <Text style={styles.groupItem}>{item}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
        {documentGroups.map((group) => (
          <View key={group.title} style={styles.groupCard}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            {group.items.map((item) => (
              <View key={item} style={styles.groupItemRow}>
                <Ionicons name="document-attach-outline" size={16} color={colors.green} />
                <Text style={styles.groupItem}>{item}</Text>
              </View>
            ))}
          </View>
        ))}
        {documents.map((doc) => (
          <TouchableOpacity key={doc.title} style={styles.documentCard} activeOpacity={0.84} onPress={() => doc.url ? Linking.openURL(doc.url) : undefined}>
            <Ionicons name="document-text-outline" size={25} color={colors.green} />
            <View style={styles.documentText}>
              <Text style={styles.documentTitle}>{doc.title}</Text>
              <Text style={styles.documentSubtitle}>{doc.subtitle}</Text>
              {doc.url ? <Text style={styles.documentLink}>Ouvrir le document</Text> : null}
            </View>
            {doc.url ? <Ionicons name="open-outline" size={18} color={colors.green} /> : null}
          </TouchableOpacity>
        ))}
      </View>
      <Notice>Les documents préparent l'échange. Ils ne valent pas acceptation d'un projet, d'un bien ou d'une collecte.</Notice>
    </ScrollView>
  );
}

function ContactScreen({ go }) {
  const orientationCards = [
    { title: "J'ai vu un lieu vacant", subtitle: "Créer un signalement terrain.", icon: "alert-circle-outline", target: "signal" },
    { title: "J'ai des matériaux", subtitle: "Proposer une ressource réutilisable.", icon: "cube-outline", target: "materials" },
    { title: "Je possède un bien", subtitle: "Présenter un logement, local ou terrain.", icon: "home-outline", target: "property" },
    { title: "Je veux aider", subtitle: "Proposer du temps ou une compétence.", icon: "people-outline", target: "volunteer" }
  ];
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ScreenTitle eyebrow="Contact" title="Joindre Territoires Vivants France">
        Choisissez un canal direct ou le parcours le plus adapté pour que votre demande soit exploitable dans TVF OS.
      </ScreenTitle>
      <View style={styles.contactChoiceCard}>
        <Text style={styles.contactChoiceTitle}>Quel est votre besoin ?</Text>
        <Text style={styles.contactChoiceText}>Le bon parcours permet de créer une demande plus claire dès le premier échange.</Text>
        <View style={styles.contactChoiceGrid}>
          {orientationCards.map((item) => (
            <TouchableOpacity key={item.target} style={styles.contactChoiceItem} onPress={() => go(item.target, { resetDraft: true })} activeOpacity={0.84}>
              <Ionicons name={item.icon} size={19} color={colors.green} />
              <View style={styles.contactChoiceCopy}>
                <Text style={styles.contactChoiceItemTitle}>{item.title}</Text>
                <Text style={styles.contactChoiceItemText}>{item.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
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

function TransmissionStatusCard({ data, isSent, isError }) {
  const rows = isSent
    ? [
        "La demande est transmise vers TVF OS.",
        "Elle peut être reprise dans TVF OS.",
        "Conservez la référence pour tout échange."
      ]
    : isError
      ? [
          "La demande reste visible sur ce téléphone.",
          "La transmission devra être relancée.",
          "Contactez TVF avec la référence si besoin."
        ]
      : [
          "La demande est préparée localement.",
          "Elle n'est pas encore visible dans TVF OS.",
          "Relancez l'envoi quand la configuration est active."
        ];
  return (
    <View style={[styles.transmissionCard, isSent && styles.transmissionCardReady, isError && styles.transmissionCardError]}>
      <View style={styles.transmissionHead}>
        <Ionicons name={isSent ? "shield-checkmark-outline" : isError ? "warning-outline" : "phone-portrait-outline"} size={21} color={isSent ? colors.green : isError ? colors.danger : colors.gold} />
        <Text style={styles.transmissionTitle}>{isSent ? "Envoi confirmé" : isError ? "Action nécessaire" : "Préparation locale"}</Text>
      </View>
      {rows.map((row) => (
        <View key={row} style={styles.transmissionRow}>
          <View style={[styles.transmissionDot, isSent && styles.transmissionDotReady, isError && styles.transmissionDotError]} />
          <Text style={styles.transmissionText}>{row}</Text>
        </View>
      ))}
      {data?.syncMessage ? <Text style={styles.transmissionNote}>{data.syncMessage}</Text> : null}
    </View>
  );
}

function ConfirmationScreen({ lastSubmission, goHome, goTracking, retryRequest, retryingReference }) {
  const data = lastSubmission || {};
  const subject = encodeURIComponent(`Demande TVF ${data.reference || ""}`.trim());
  const isSent = data.syncMode === "supabase";
  const isError = data.syncMode === "supabase-error";
  const statusTitle = isSent ? "Demande transmise" : isError ? "Transmission à finaliser" : "Demande préparée";
  const statusLabel = isSent ? "Envoi TVF OS confirmé" : isError ? "Non transmis" : "Mode local";
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
        <Text style={styles.confirmText}>{isSent ? "Votre demande est prête à être traitée par TVF." : "Votre demande est conservée sur ce téléphone avec sa référence."}</Text>
        <TransmissionStatusCard data={data} isSent={isSent} isError={isError} />
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Récapitulatif</Text>
          <Text style={styles.summaryLine}>Type : {data.label || "Non renseigné"}</Text>
          <Text style={styles.summaryLine}>Catégorie : {data.categoryLabel || data.category || "Non renseignée"}</Text>
          <Text style={styles.summaryLine}>Localisation : {data.address || "À compléter"}</Text>
          <Text style={styles.summaryLine}>Statut : {getLocalStatusLabel(data)}</Text>
          <Text style={styles.summaryLine}>Priorité : {getPriorityLabel(data.priority)}</Text>
          <Text style={styles.summaryLine}>Date : {formatShortDate(data.createdAt || data.updatedAt)}</Text>
          <Text style={styles.summaryLine}>Photos : {data.photoCount ? `${data.photoCount} jointe(s)` : data.hasPhoto ? "1 jointe" : "non jointes"}</Text>
          <Text style={styles.summaryLine}>GPS : {data.hasCoordinates ? "enregistré" : "non renseigné"}</Text>
          <Text style={styles.summaryLine}>Transmission : {isSent ? "transmise vers TVF OS" : isError ? "à renvoyer" : "locale uniquement"}</Text>
        </View>
        <NextStepsTimeline />
        {requestCanBeRetried(data) ? (
          <PrimaryButton icon="cloud-upload-outline" loading={retryingReference === data.reference} onPress={() => retryRequest(data)}>
            {retryingReference === data.reference ? "Renvoi en cours..." : "Renvoyer vers TVF OS"}
          </PrimaryButton>
        ) : null}
        <PrimaryButton secondary icon="share-social-outline" onPress={() => Share.share({ message: `Demande TVF ${data.reference || ""}` })}>Partager la référence</PrimaryButton>
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
  const [retryingReference, setRetryingReference] = useState(null);
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

  const dismissDraft = () => {
    Alert.alert("Supprimer le brouillon ?", "La demande commencée sera effacée de ce téléphone.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: () => {
          setDraft(initialDraft);
          clearDraftStorage();
          setDraftRestored(false);
        }
      }
    ]);
  };
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

  const retryRequest = async (request) => {
    if (!request?.payload || retryingReference) return;
    setRetryingReference(request.reference);
    try {
      const result = await submitMobileRequest(request.payload);
      const updated = {
        ...request,
        syncMode: result.mode,
        syncMessage: result.message,
        updatedAt: new Date().toISOString()
      };
      setLastSubmission((current) => current?.reference === request.reference ? updated : current);
      setSelectedRequest((current) => current?.reference === request.reference ? updated : current);
      setSubmissionHistory((items) => {
        const next = items.map((item) => item.reference === request.reference ? updated : item);
        saveSubmissionHistory(next);
        return next;
      });
      Alert.alert(result.ok ? "Renvoi effectué" : "Renvoi non finalisé", result.message || "La demande reste enregistrée sur ce téléphone.");
    } finally {
      setRetryingReference(null);
    }
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
        flow,
        label: flowLabels[flow],
        category: draft.category,
        categoryLabel,
        address: draft.address,
        email: draft.email,
        phone: draft.phone,
        hasPhoto: Boolean(draft.photoUri),
        photoCount: Array.isArray(draft.photos) && draft.photos.length ? draft.photos.length : (draft.photoUri ? 1 : 0),
        hasCoordinates: Boolean(draft.latitude && draft.longitude),
        syncMode: result.mode,
        syncMessage: result.message,
        priority: payload.summary?.priority || "normale",
        createdAt: new Date().toISOString(),
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
        return <RequestsScreen submissionHistory={submissionHistory} goTracking={() => go("tracking")} openRequest={openRequest} retryRequest={retryRequest} retryingReference={retryingReference} />;
      case "tracking":
        return <TrackingScreen lastSubmission={lastSubmission} submissionHistory={submissionHistory} openRequest={openRequest} />;
      case "request-detail":
        return <RequestDetailScreen request={selectedRequest} goBack={() => go("requests")} goTracking={() => go("tracking")} retryRequest={retryRequest} retryingReference={retryingReference} />;
      case "documents":
        return <DocumentsScreen />;
      case "contact":
        return <ContactScreen go={go} />;
      case "confirmation":
        return <ConfirmationScreen lastSubmission={lastSubmission} goHome={() => go("home")} goTracking={() => go("tracking")} retryRequest={retryRequest} retryingReference={retryingReference} />;
      case "home":
      default:
        return <HomeScreen go={go} draftRestored={draftRestored} dismissDraft={dismissDraft} />;
    }
  }, [screen, draft, lastSubmission, submissionHistory, selectedRequest, missing, submitting, retryingReference, draftReady, draftRestored]);

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
  draftResumeArea: { flexDirection: "row", alignItems: "center", gap: 11 },
  draftClearButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.soft,
    marginLeft: 53
  },
  draftClearText: { color: colors.muted, fontWeight: "800", fontSize: 12.5 },
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
  },
  quickStats: { flexDirection: "row", gap: 10, marginBottom: 14 },
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
  homeFlowCard: {
    backgroundColor: colors.green,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 16,
    gap: 10,
    ...shadow
  },
  homeFlowStep: { flexDirection: "row", alignItems: "center", gap: 10 },
  homeFlowNumber: {
    width: 28,
    height: 28,
    borderRadius: 99,
    backgroundColor: colors.white,
    color: colors.green,
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 28
  },
  homeFlowText: { flex: 1, color: colors.white, fontWeight: "700", fontSize: 13.2, lineHeight: 18 },
  actionSection: { marginTop: 4, marginBottom: 18 },
  actionSectionHeader: { marginBottom: 10 },
  actionSectionTitle: { color: colors.blue, fontSize: 18, fontWeight: "900" },
  actionSectionSubtitle: { color: colors.muted, fontSize: 12.8, fontWeight: "600", marginTop: 2 },
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
  labelRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 6 },
  label: { flex: 1, color: colors.green, fontWeight: "800", fontSize: 13 },
  requiredTag: { color: colors.danger, backgroundColor: "#FFF1EF", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, fontSize: 10.5, fontWeight: "900", textTransform: "uppercase" },
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
  fieldHint: { color: colors.muted, fontSize: 12, fontWeight: "600", lineHeight: 17, marginTop: 6 },
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
  mediaWrap: { marginBottom: 2 },
  photoBox: {
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
  photoStrip: { flexDirection: "row", flexWrap: "wrap", gap: 9, marginTop: 10, marginBottom: 8 },
  photoThumbWrap: { width: 64, height: 64, borderRadius: 18, overflow: "hidden", borderWidth: 1, borderColor: colors.line },
  photoThumb: { width: "100%", height: "100%", resizeMode: "cover" },
  photoRemoveBadge: { position: "absolute", top: 4, right: 4, width: 20, height: 20, borderRadius: 999, backgroundColor: "rgba(8, 33, 49, 0.82)", alignItems: "center", justifyContent: "center" },
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
  contactRequiredNote: { color: colors.green, fontWeight: "800", fontSize: 12.4, lineHeight: 18, marginBottom: 10 },
  completionCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#CFE0D1",
    padding: 13,
    marginBottom: 14
  },
  completionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10
  },
  completionTitle: { color: colors.blue, fontWeight: "800", fontSize: 14.5 },
  completionText: { color: colors.muted, fontWeight: "600", fontSize: 12.4, marginTop: 2 },
  completionPercent: { color: colors.green, fontWeight: "900", fontSize: 18 },
  completionTrack: {
    height: 8,
    borderRadius: 99,
    backgroundColor: colors.soft,
    overflow: "hidden"
  },
  completionFill: {
    height: "100%",
    borderRadius: 99,
    backgroundColor: colors.green2
  },
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
  previewLine: { color: colors.blue, fontWeight: "600", lineHeight: 21, fontSize: 13 },
  errorHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  errorTitle: { color: colors.danger, fontWeight: "900", fontSize: 14 },
  errorRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 2 },
  errorDot: { width: 6, height: 6, borderRadius: 99, backgroundColor: colors.danger },
  notice: {
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
  actionPlanCard: {
    backgroundColor: "#F8FBF7",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "#CFE0D1",
    padding: 15,
    marginBottom: 14
  },
  actionPlanHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  actionPlanHeaderText: { flex: 1 },
  actionPlanTitle: { color: colors.green, fontWeight: "900", fontSize: 15.5 },
  actionPlanSubtitle: { color: colors.muted, fontWeight: "700", fontSize: 12.3, marginTop: 2 },
  actionPlanRow: { flexDirection: "row", alignItems: "flex-start", gap: 9, paddingVertical: 4 },
  actionPlanText: { flex: 1, color: colors.blue, fontWeight: "600", fontSize: 12.8, lineHeight: 18 },
  foundRequestCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "#CFE0D1",
    padding: 15,
    marginBottom: 14,
    ...shadow
  },
  foundRequestHead: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  foundRequestText: { flex: 1 },
  foundRequestTitle: { color: colors.green, fontWeight: "900", fontSize: 15 },
  foundRequestMeta: { color: colors.muted, fontWeight: "600", fontSize: 12.5, marginTop: 2 },
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
  requestBadgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 8 },
  requestBadge: {
    alignSelf: "flex-start",
    color: colors.gold,
    backgroundColor: "#FFF7E4",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
    fontSize: 11.4,
    fontWeight: "900"
  },
  requestBadgeReady: { color: colors.green, backgroundColor: "#EDF7EC" },
  requestBadgeHigh: { color: colors.danger, backgroundColor: "#FFF1EF" },
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
  documentIntroCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    padding: 15,
    marginBottom: 14,
    ...shadow
  },
  documentIntroText: { flex: 1 },
  documentIntroTitle: { color: colors.green, fontWeight: "900", fontSize: 16, marginBottom: 3 },
  documentIntroCopy: { color: colors.muted, fontWeight: "600", fontSize: 12.7, lineHeight: 18 },
  preparationCard: {
    backgroundColor: "#F8FBF7",
    borderWidth: 1,
    borderColor: "#CFE0D1",
    borderRadius: radius.lg,
    padding: 15
  },
  preparationHead: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  preparationIcon: {
    width: 34,
    height: 34,
    borderRadius: 13,
    backgroundColor: colors.green,
    alignItems: "center",
    justifyContent: "center"
  },
  preparationTitle: { flex: 1, color: colors.blue, fontWeight: "900", fontSize: 15.2 },
  preparationRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, paddingVertical: 4 },
  preparationText: { flex: 1, color: colors.blue, fontWeight: "600", fontSize: 12.8, lineHeight: 18 },
  groupCard: {
    backgroundColor: colors.soft,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: 14
  },
  groupTitle: { color: colors.green, fontWeight: "800", fontSize: 15, marginBottom: 8 },
  groupItemRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, paddingVertical: 4 },
  groupItem: { flex: 1, color: colors.blue, fontWeight: "600", lineHeight: 19, fontSize: 12.8 },
  testTrackCard: { borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 10, marginTop: 10 },
  testTrackHead: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 6 },
  testTrackTitle: { color: colors.green, fontWeight: "900", fontSize: 13.2 },
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
  documentLink: { color: colors.green, fontWeight: "900", fontSize: 12.2, marginTop: 5 },
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
  contactChoiceCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 15,
    marginBottom: 14,
    ...shadow
  },
  contactChoiceTitle: { color: colors.green, fontWeight: "900", fontSize: 16, marginBottom: 3 },
  contactChoiceText: { color: colors.muted, fontWeight: "600", fontSize: 12.8, lineHeight: 18, marginBottom: 12 },
  contactChoiceGrid: { gap: 9 },
  contactChoiceItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#CFE0D1",
    backgroundColor: "#F8FBF7",
    borderRadius: radius.md,
    padding: 12
  },
  contactChoiceCopy: { flex: 1 },
  contactChoiceItemTitle: { color: colors.blue, fontWeight: "800", fontSize: 13.5 },
  contactChoiceItemText: { color: colors.muted, fontWeight: "600", fontSize: 12, lineHeight: 16, marginTop: 2 },
  transmissionCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 15,
    marginBottom: 14
  },
  transmissionCardReady: { borderColor: "#B7D2BA", backgroundColor: "#F8FBF7" },
  transmissionCardError: { borderColor: "#E7B7B2", backgroundColor: "#FFF7F5" },
  transmissionHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 9 },
  transmissionTitle: { color: colors.blue, fontWeight: "900", fontSize: 15.2 },
  transmissionRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 3 },
  transmissionDot: { width: 7, height: 7, borderRadius: 99, backgroundColor: colors.gold },
  transmissionDotReady: { backgroundColor: colors.green2 },
  transmissionDotError: { backgroundColor: colors.danger },
  transmissionText: { flex: 1, color: colors.blue, fontWeight: "600", fontSize: 12.8, lineHeight: 18 },
  transmissionNote: { color: colors.muted, fontWeight: "600", fontSize: 12, lineHeight: 17, marginTop: 8 },
  timelineCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 15,
    marginBottom: 14
  },
  timelineTitle: { color: colors.green, fontWeight: "900", fontSize: 15.5, marginBottom: 10 },
  timelineRow: { flexDirection: "row", gap: 11, alignItems: "flex-start", paddingVertical: 7 },
  timelineMarker: {
    width: 28,
    height: 28,
    borderRadius: 99,
    backgroundColor: colors.green,
    alignItems: "center",
    justifyContent: "center"
  },
  timelineMarkerText: { color: colors.white, fontWeight: "900", fontSize: 12 },
  timelineTextWrap: { flex: 1 },
  timelineStep: { color: colors.blue, fontWeight: "800", fontSize: 13.5, lineHeight: 18 },
  timelineHint: { color: colors.muted, fontWeight: "600", fontSize: 12.2, lineHeight: 17, marginTop: 2 },
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