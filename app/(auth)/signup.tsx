import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Image } from "react-native";
import { Link, router } from "expo-router";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import { useAppConfig } from "@/stores/AppConfigStore";
import { EyeIcon, EyeOffIcon } from "lucide-react-native";
import { useAuth } from "@/stores/AuthStore";
import { useToast, Toast, ToastTitle, ToastDescription } from "@/components/ui/toast";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // const { setAppType } = useAppConfig();
  const authContext = useAuth();
  const toast = useToast();
  
  console.log("=== SIGNUP COMPONENT ===");
  console.log("Auth context:", authContext);

  const handleSignUp = async () => {
    console.log("=== HANDLE SIGNUP CALLED ===");
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Password:", password);
    
    if (!name.trim() || !email.trim() || !password.trim()) {
      console.log("Validation failed: empty fields");
      toast.show({
        placement: "top",
        render: ({ id }) => {
          return (
            <Toast nativeID={`toast-${id}`} action="error" variant="solid">
              <ToastTitle>Erro</ToastTitle>
              <ToastDescription>Por favor, preencha todos os campos</ToastDescription>
            </Toast>
          );
        },
      });
      return;
    }

    if (password.length < 6) {
      console.log("Validation failed: password too short");
      toast.show({
        placement: "top",
        render: ({ id }) => {
          return (
            <Toast nativeID={`toast-${id}`} action="error" variant="solid">
              <ToastTitle>Erro</ToastTitle>
              <ToastDescription>A senha deve ter pelo menos 6 caracteres</ToastDescription>
            </Toast>
          );
        },
      });
      return;
    }

    try {
      console.log("Calling register function...");
      const success = await authContext.register(name.trim(), email.trim(), password);
      
      console.log("Register result:", success);
      
      if (success) {
        console.log("Registration successful");
        toast.show({
          placement: "top",
          render: ({ id }) => {
            return (
              <Toast nativeID={`toast-${id}`} action="success" variant="solid">
                <ToastTitle>Sucesso</ToastTitle>
                <ToastDescription>Cadastro realizado com sucesso!</ToastDescription>
              </Toast>
            );
          },
        });
        // Don't set app type here - let the existing app type persist
        // The AppRouteGuard will handle the navigation
      } else {
        console.log("Registration failed, showing toast");
        toast.show({
          placement: "top",
          render: ({ id }) => {
            return (
              <Toast nativeID={`toast-${id}`} action="error" variant="solid">
                <ToastTitle>Erro de Cadastro</ToastTitle>
                <ToastDescription>{authContext.state.error || "Falha no cadastro"}</ToastDescription>
              </Toast>
            );
          },
        });
      }
    } catch (error) {
      console.error("Handle signup error:", error);
      toast.show({
        placement: "top",
        render: ({ id }) => {
          return (
            <Toast nativeID={`toast-${id}`} action="error" variant="solid">
              <ToastTitle>Erro</ToastTitle>
              <ToastDescription>Erro de conexão. Tente novamente.</ToastDescription>
            </Toast>
          );
        },
      });
    }
  };

  // For demo purposes - switch to user mode
  const switchToUserMode = async () => {
    // await setAppType("user");
    router.replace("/(tabs)");
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logo}
          alt="DICIONÁRIO KRIKATI logo"
        />
      </View>

      <View style={styles.formContainer}>
        {/* <Text style={styles.subtitle}>Cadastro Administrativo</Text> */}
        
        <Input className="mb-4 border-[#4B2C0B] border-2" label="Nome" forceWhiteTheme>
          <InputField
            value={name}
            onChangeText={setName}
          />
        </Input>

        <Input className="mb-4   border-[#4B2C0B] border-2" label="E-mail" forceWhiteTheme>
          <InputField
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </Input>

        <Input className="mb-4  border-[#4B2C0B] border-2" label="Senha" forceWhiteTheme>
          <InputField
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <InputSlot onPress={() => setShowPassword(!showPassword)} className="mr-2">
            <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} className="text-[#4B2C0B]" />
          </InputSlot>
        </Input>

        <Button
          className="bg-[#B34700] text-white mt-4 rounded-md"
          onPress={handleSignUp}
          disabled={authContext.state.isLoading}
        >
          <ButtonText className="font-bold text-white ">
            {authContext.state.isLoading ? "CADASTRANDO..." : "CADASTRAR"}
          </ButtonText>
        </Button>

        <Link href="/signin" asChild>
          <Pressable style={styles.linkContainer}>
            <Text style={styles.linkText}>
              Já possui cadastro?{" "}
              <Text style={styles.linkHighlight}>Faça o login</Text>
            </Text>
          </Pressable>
        </Link>

        {/* <Pressable style={styles.userModeLink} onPress={switchToUserMode}>
          <Text style={styles.userModeText}>Entrar como usuário comum</Text>
        </Pressable> */}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© IFMA Imperatriz</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF9F0",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 40,
    flexDirection: "column",
    gap: 40,
  },
  titleContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  logo: {
    width: 312.9921875,
    height: 115,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#B34700",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4B2C0B",
    marginBottom: 20,
    textAlign: "center",
  },
  formContainer: {
    width: "90%",
    maxWidth: 370,
    display: 'flex',
    flexDirection: 'column',
    gap: 14
  },
  linkContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  linkText: {
    color: "#4B2C0B",
    textAlign: "center",
  },
  linkHighlight: {
    fontWeight: "bold",
    color: "#B34700",
    textDecorationLine: "underline",
  },
  userModeLink: {
    marginTop: 30,
    padding: 10,
    alignItems: "center",
  },
  userModeText: {
    color: "#4B2C0B",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  footer: {
    marginTop: "auto",
  },
  footerText: {
    color: "#4B2C0B",
    fontSize: 12,
  },
});
