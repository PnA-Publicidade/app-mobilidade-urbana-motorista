// CODEX: 486 linhas criadas neste arquivo para detalhes, ajuda e cancelamento seguro da corrida ativa.
import CentralAjuda from "@/components/CentralAjuda";
import type { PassageiroDaCorrida } from "@/components/CorridaEmAndamento";
import { Text } from "@/components/common/Texto";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  visible: boolean;
  passageiro?: PassageiroDaCorrida | null;
  origem?: string | null;
  destino?: string | null;
  ocupado?: boolean;
  onClose: () => void;
  onCancelar: (motivo: string) => Promise<boolean>;
}

const MOTIVOS_CANCELAMENTO = [
  "Embarque longe",
  "Endereço errado",
  "Passageiro chamou para um terceiro",
  "Passageiro pediu para cancelar",
  "Estava em outra corrida",
  "Poucos assentos",
  "Muita bagagem",
  "Passageiro menor de idade",
  "Área de risco",
  "Local de embarque errado",
  "Outro",
] as const;

export default function MaisCorridaAtiva({
  visible,
  passageiro,
  origem,
  destino,
  ocupado = false,
  onClose,
  onCancelar,
}: Props) {
  const insets = useSafeAreaInsets();
  const [tela, setTela] = useState<"mais" | "motivos">("mais");
  const [motivo, setMotivo] = useState<string | null>(null);
  const [confirmacaoVisivel, setConfirmacaoVisivel] = useState(false);
  const [ajudaVisivel, setAjudaVisivel] = useState(false);
  const [cancelando, setCancelando] = useState(false);

  const fechar = () => {
    if (cancelando) return;
    setTela("mais");
    setMotivo(null);
    setConfirmacaoVisivel(false);
    setAjudaVisivel(false);
    onClose();
  };

  const voltar = () => {
    if (confirmacaoVisivel) {
      setConfirmacaoVisivel(false);
      return;
    }
    if (tela === "motivos") {
      setTela("mais");
      setMotivo(null);
      return;
    }
    fechar();
  };

  const ligar = () => {
    const telefone = passageiro?.telefone?.replace(/\D/g, "");
    if (telefone) void Linking.openURL(`tel:${telefone}`);
  };

  const escolherMotivo = (item: string) => {
    setMotivo(item);
    setConfirmacaoVisivel(true);
  };

  const confirmarCancelamento = async () => {
    if (motivo === null || cancelando || ocupado) return;
    setCancelando(true);
    const cancelada = await onCancelar(motivo);
    setCancelando(false);
    if (cancelada) {
      setTela("mais");
      setMotivo(null);
      setConfirmacaoVisivel(false);
      setAjudaVisivel(false);
      onClose();
    }
  };

  const mostrarPolitica = () => {
    Alert.alert(
      "Política de cancelamento",
      "O motivo será registrado no histórico. Ao confirmar, a corrida termina e você volta a ficar disponível para novas solicitações.",
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent
      onRequestClose={voltar}
    >
      <View style={styles.tela}>
        <View style={[styles.cabecalho, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity
            style={styles.botaoVoltar}
            onPress={voltar}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
          >
            <Ionicons name="chevron-back" size={26} color="#111" />
          </TouchableOpacity>
          <Text style={styles.tituloCabecalho}>
            {tela === "mais" ? "Mais" : "Cancelar corrida"}
          </Text>
          <View style={styles.espacoCabecalho} />
        </View>

        {tela === "mais" ? (
          <ScrollView
            contentContainerStyle={styles.conteudoMais}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.etiquetaCategoria}>Corrida atual</Text>

            <View style={styles.cartaoCorrida}>
              <View style={styles.linhaPassageiro}>
                {passageiro?.foto && !passageiro.foto_oculta ? (
                  <Image
                    source={{ uri: passageiro.foto }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={[styles.avatar, styles.avatarVazio]}>
                    <Feather name="user" size={24} color="#8B94A1" />
                  </View>
                )}

                <View style={styles.dadosPassageiro}>
                  <Text style={styles.nomePassageiro}>
                    {passageiro?.nome ?? "Passageiro"}
                  </Text>
                  <Text style={styles.reputacao}>
                    {typeof passageiro?.nota === "number"
                      ? passageiro.nota.toFixed(2).replace(".", ",")
                      : "0,0"}
                    {" ★ · "}
                    {passageiro?.corridas ?? 0}{" "}
                    {passageiro?.corridas === 1 ? "corrida" : "corridas"}
                  </Text>
                </View>

                {passageiro?.telefone ? (
                  <TouchableOpacity
                    style={styles.botaoLigar}
                    onPress={ligar}
                    accessibilityRole="button"
                    accessibilityLabel={`Ligar para ${passageiro.nome}`}
                  >
                    <Feather name="phone" size={21} color="#111" />
                  </TouchableOpacity>
                ) : null}
              </View>

              <View style={styles.separador} />

              <View style={styles.enderecoLinha}>
                <View style={[styles.pontoEndereco, styles.pontoOrigem]}>
                  <Ionicons name="arrow-up" size={12} color="#FFF" />
                </View>
                <Text style={styles.enderecoTexto}>
                  {origem ?? "Local de embarque não informado"}
                </Text>
              </View>

              <View style={styles.enderecoLinha}>
                <View style={[styles.pontoEndereco, styles.pontoDestino]}>
                  <Ionicons name="arrow-down" size={12} color="#FFF" />
                </View>
                <Text style={styles.enderecoTexto}>
                  {destino ?? "Destino não informado"}
                </Text>
              </View>

              <View style={styles.acoesCartao}>
                <TouchableOpacity
                  style={styles.botaoSecundario}
                  onPress={() => setTela("motivos")}
                >
                  <Text style={styles.botaoSecundarioTexto}>
                    Cancelar corrida
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.botaoSecundario}
                  onPress={() => setAjudaVisivel(true)}
                >
                  <Text style={styles.botaoSecundarioTexto}>
                    Central de Ajuda
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        ) : (
          <ScrollView
            contentContainerStyle={styles.conteudoMotivos}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.tituloMotivos}>
              Por favor, conte o motivo do cancelamento
            </Text>
            {MOTIVOS_CANCELAMENTO.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.motivoItem,
                  motivo === item && styles.motivoSelecionado,
                ]}
                activeOpacity={0.7}
                onPress={() => escolherMotivo(item)}
              >
                <Text style={styles.motivoTexto}>{item}</Text>
                <Ionicons name="chevron-forward" size={18} color="#AAA" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {confirmacaoVisivel && (
          <View style={styles.confirmacaoCamada}>
            <Pressable
              style={styles.confirmacaoFundo}
              onPress={() => setConfirmacaoVisivel(false)}
            />
            <View
              style={[
                styles.confirmacaoFolha,
                { paddingBottom: Math.max(insets.bottom, 16) },
              ]}
            >
              <Text style={styles.confirmacaoTitulo}>
                Deseja mesmo cancelar esta corrida?
              </Text>
              <Text style={styles.confirmacaoMotivo}>{motivo}</Text>
              <TouchableOpacity
                style={styles.politicaLinha}
                onPress={mostrarPolitica}
              >
                <Text style={styles.politicaTexto}>
                  Política de cancelamento
                </Text>
                <Ionicons name="chevron-forward" size={18} color="#777" />
              </TouchableOpacity>
              <View style={styles.confirmacaoAcoes}>
                <TouchableOpacity
                  style={[styles.botaoConfirmacao, styles.botaoNaoCancelar]}
                  disabled={cancelando}
                  onPress={() => setConfirmacaoVisivel(false)}
                >
                  <Text style={styles.botaoNaoCancelarTexto}>Não cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.botaoConfirmacao,
                    styles.botaoCancelar,
                    (cancelando || ocupado) && styles.botaoDesabilitado,
                  ]}
                  disabled={cancelando || ocupado}
                  onPress={() => void confirmarCancelamento()}
                >
                  {cancelando ? (
                    <ActivityIndicator color="#111" />
                  ) : (
                    <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        <CentralAjuda
          visible={ajudaVisivel}
          onClose={() => setAjudaVisivel(false)}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: "#F6F7F9" },
  cabecalho: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingBottom: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#DADDE1",
  },
  botaoVoltar: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  tituloCabecalho: {
    flex: 1,
    color: "#111",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  espacoCabecalho: { width: 44 },
  conteudoMais: { padding: 16, paddingBottom: 40 },
  etiquetaCategoria: {
    alignSelf: "flex-start",
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
    backgroundColor: "#E8EBF0",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 9,
    marginBottom: 10,
  },
  cartaoCorrida: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  linhaPassageiro: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  avatarVazio: {
    backgroundColor: "#E6EDF5",
    alignItems: "center",
    justifyContent: "center",
  },
  dadosPassageiro: { flex: 1 },
  nomePassageiro: { color: "#111", fontSize: 18, fontWeight: "700" },
  reputacao: { color: "#777", fontSize: 13, marginTop: 3 },
  botaoLigar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
  },
  separador: { height: 1, backgroundColor: "#EEE", marginVertical: 14 },
  enderecoLinha: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 12,
  },
  pontoEndereco: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  pontoOrigem: { backgroundColor: "#18C9A0" },
  pontoDestino: { backgroundColor: "#FF7A2F" },
  enderecoTexto: {
    flex: 1,
    color: "#252525",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 19,
  },
  acoesCartao: { flexDirection: "row", gap: 10, marginTop: 4 },
  botaoSecundario: {
    flex: 1,
    minHeight: 48,
    borderRadius: 10,
    backgroundColor: "#F1F1F2",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  botaoSecundarioTexto: {
    color: "#222",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  conteudoMotivos: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  tituloMotivos: {
    color: "#111",
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 30,
    marginBottom: 22,
  },
  motivoItem: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E8E8E8",
    paddingHorizontal: 14,
  },
  motivoSelecionado: { backgroundColor: "#EAF2F8", borderRadius: 8 },
  motivoTexto: { flex: 1, color: "#252525", fontSize: 16 },
  confirmacaoCamada: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 40,
    justifyContent: "flex-end",
  },
  confirmacaoFundo: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(16,24,32,0.62)",
  },
  confirmacaoFolha: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: 22,
    paddingHorizontal: 20,
  },
  confirmacaoTitulo: {
    color: "#111",
    fontSize: 21,
    fontWeight: "700",
    lineHeight: 27,
  },
  confirmacaoMotivo: { color: "#666", fontSize: 14, marginTop: 6 },
  politicaLinha: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    minHeight: 44,
    marginTop: 8,
  },
  politicaTexto: { color: "#555", fontSize: 13 },
  confirmacaoAcoes: { flexDirection: "row", gap: 12, marginTop: 8 },
  botaoConfirmacao: {
    flex: 1,
    minHeight: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  botaoNaoCancelar: { backgroundColor: "#F0F0F2" },
  botaoCancelar: { backgroundColor: "#FFD600" },
  botaoDesabilitado: { opacity: 0.55 },
  botaoNaoCancelarTexto: { color: "#111", fontSize: 15, fontWeight: "700" },
  botaoCancelarTexto: { color: "#111", fontSize: 15, fontWeight: "700" },
});
