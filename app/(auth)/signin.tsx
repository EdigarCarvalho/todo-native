import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Image } from "react-native";
import { Link, router } from "expo-router";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import { useAppConfig } from "@/stores/AppConfigStore";
import { EyeIcon, EyeOffIcon } from "lucide-react-native";
import { useAuth } from "@/stores/AuthStore";
import { useToast, Toast, ToastTitle, ToastDescription } from "@/components/ui/toast";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // const { setAppType } = useAppConfig();
  const authContext = useAuth();
  const toast = useToast();
  
  console.log("=== SIGNIN COMPONENT ===");
  console.log("Auth context:", authContext);
  console.log("Auth state:", authContext.state);

  const handleLogin = async () => {
    console.log("=== HANDLE LOGIN CALLED ===");
    console.log("Email:", email);
    console.log("Password:", password);
    
    if (!email.trim() || !password.trim()) {
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

    try {
      console.log("Calling login function...");
      const success = await authContext.login(email.trim(), password);
      
      console.log("Login result:", success);
      
      if (success) {
        console.log("Login successful, navigating to tabs...");
        toast.show({
          placement: "top",
          render: ({ id }) => {
            return (
              <Toast nativeID={`toast-${id}`} action="success" variant="solid">
                <ToastTitle>Sucesso</ToastTitle>
                <ToastDescription>Login realizado com sucesso!</ToastDescription>
              </Toast>
            );
          },
        });
        // Don't set app type here - let the existing app type persist
        // The AppRouteGuard will handle the navigation
      } else {
        console.log("Login failed, showing toast");
        toast.show({
          placement: "top",
          render: ({ id }) => {
            return (
              <Toast nativeID={`toast-${id}`} action="error" variant="solid">
                <ToastTitle>Erro de Login</ToastTitle>
                <ToastDescription>{authContext.state.error || "Credenciais inválidas"}</ToastDescription>
              </Toast>
            );
          },
        });
      }
    } catch (error) {
      console.error("Handle login error:", error);
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
        {/* <Text style={styles.subtitle}>Login Administrativo</Text> */}

        <Input className="mb-6 border-[#4B2C0B] border-2" label="E-mail" forceWhiteTheme>
          <InputField
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </Input>

        <Input className="mb-2 border-[#4B2C0B] border-2" label="Senha" forceWhiteTheme>
          <InputField
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
         <InputSlot onPress={() => setShowPassword(!showPassword)} className="mr-2">
            <InputIcon
              as={showPassword ? EyeIcon : EyeOffIcon}
              className="text-[#4B2C0B]"
            />
          </InputSlot>
        </Input>

        {/* <Pressable style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Recuperar senha</Text>
        </Pressable> */}

        <Button 
          className="bg-[#B34700] rounded-md" 
          onPress={handleLogin}
          disabled={authContext.state.isLoading}
        >
          <ButtonText className="font-bold text-white">
            {authContext.state.isLoading ? "ENTRANDO..." : "ENTRAR"}
          </ButtonText>
        </Button>

        <Link href="/signup" asChild>
          <Pressable style={styles.linkContainer}>
            <Text style={styles.linkText}>
              Não possui cadastro?{" "}
              <Text style={styles.linkHighlight}>Faça aqui</Text>
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
    justifyContent: "center",
    paddingVertical: 40,
    flexDirection: "column",
    height: "100%",
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
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: -8,
    marginBottom: 4,
  },
  forgotPasswordText: {
    color: "#4B2C0B",
    fontSize: 12,
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
