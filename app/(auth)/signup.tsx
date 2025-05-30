import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Image } from "react-native";
import { Link, router } from "expo-router";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import { useAppConfig } from "@/stores/AppConfigStore";
import { EyeIcon, EyeOffIcon } from "lucide-react-native";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { setAppType } = useAppConfig();

  const handleSignUp = async () => {
    // In a real app, you would validate and register here
    console.log("Sign up with:", name, email, password);
    
    // For demo purposes, just navigate to the main app
    router.replace("/(tabs)");
  };

  // For demo purposes - switch to user mode
  const switchToUserMode = async () => {
    await setAppType("user");
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
        
        <Input className="mb-4 border-[#4B2C0B] border-2" label="Nome">
          <InputField
            value={name}
            onChangeText={setName}
          />
        </Input>

        <Input className="mb-4   border-[#4B2C0B] border-2" label="E-mail">
          <InputField
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </Input>

        <Input className="mb-4  border-[#4B2C0B] border-2" label="Senha">
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
          className="bg-[#B34700] mt-4 rounded-md"
          onPress={handleSignUp}
        >
          <ButtonText className="font-bold">CADASTRAR</ButtonText>
        </Button>

        <Link href="/signin" asChild>
          <Pressable style={styles.linkContainer}>
            <Text style={styles.linkText}>
              Já possui cadastro?{" "}
              <Text style={styles.linkHighlight}>Faça o login</Text>
            </Text>
          </Pressable>
        </Link>

        <Pressable style={styles.userModeLink} onPress={switchToUserMode}>
          <Text style={styles.userModeText}>Entrar como usuário comum</Text>
        </Pressable>
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
