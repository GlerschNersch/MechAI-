import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@/lib/store';
import { chatWithMechAI, type AIMessage } from '@/lib/ai/claude';

const SUGGESTIONS = [
  'What does P0300 mean?',
  'Is it safe to drive with a misfire?',
  'How much does a catalytic converter cost?',
  'What causes a lean fuel mixture?',
];

export default function AIScreen() {
  const { vehicles, activeVehicleId } = useAppStore();
  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId) ?? null;

  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const sendMessage = async (text?: string) => {
    const messageText = text ?? input.trim();
    if (!messageText || loading) return;

    const userMessage: AIMessage = { role: 'user', content: messageText };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const reply = await chatWithMechAI(messageText, activeVehicle, messages);
      setMessages([...newHistory, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages([
        ...newHistory,
        {
          role: 'assistant',
          content: `⚠️ ${String(err)}\n\nMake sure you've added your Anthropic API key to the .env file.`,
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-muted">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        {/* Header */}
        <View className="px-4 pt-4 pb-2 flex-row items-center justify-between">
          <View>
            <Text className="text-white text-2xl font-bold">AI Mechanic</Text>
            <Text className="text-slate-400 text-sm">
              {activeVehicle
                ? `${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`
                : 'Ask me anything about your car'}
            </Text>
          </View>
          <Text className="text-3xl">🤖</Text>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          className="flex-1 px-4"
          contentContainerStyle={{ paddingVertical: 8 }}
        >
          {messages.length === 0 && (
            <View className="items-center py-6">
              <Text className="text-5xl mb-4">🔧</Text>
              <Text className="text-white text-lg font-bold mb-2">Ask MechAI anything</Text>
              <Text className="text-slate-400 text-sm text-center mb-6">
                I can explain fault codes, estimate repair costs, and help you understand what's wrong with your vehicle.
              </Text>
              <View className="w-full gap-2">
                {SUGGESTIONS.map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => sendMessage(s)}
                    className="bg-surface-raised rounded-xl px-4 py-3"
                  >
                    <Text className="text-brand-400 text-sm">{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {messages.map((msg, i) => (
            <View
              key={i}
              className={`mb-3 max-w-[85%] ${msg.role === 'user' ? 'self-end' : 'self-start'}`}
            >
              {msg.role === 'assistant' && (
                <Text className="text-slate-500 text-xs mb-1 ml-1">🤖 MechAI</Text>
              )}
              <View
                className={`rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-brand-600 rounded-tr-sm'
                    : 'bg-surface-raised rounded-tl-sm'
                }`}
              >
                <Text
                  className={`text-sm leading-5 ${
                    msg.role === 'user' ? 'text-white' : 'text-slate-200'
                  }`}
                >
                  {msg.content}
                </Text>
              </View>
            </View>
          ))}

          {loading && (
            <View className="self-start bg-surface-raised rounded-2xl rounded-tl-sm px-4 py-3 mb-3">
              <ActivityIndicator size="small" color="#0ea5e9" />
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View className="px-4 pb-4 pt-2 flex-row items-end gap-2">
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask about your car..."
            placeholderTextColor="#64748b"
            multiline
            maxLength={500}
            className="flex-1 bg-surface-raised text-white rounded-2xl px-4 py-3 text-sm"
            style={{ maxHeight: 100 }}
            onSubmitEditing={() => sendMessage()}
          />
          <TouchableOpacity
            onPress={() => sendMessage()}
            disabled={!input.trim() || loading}
            className={`w-11 h-11 rounded-full items-center justify-center ${
              input.trim() && !loading ? 'bg-brand-600' : 'bg-slate-700'
            }`}
          >
            <Text className="text-white text-lg">↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
