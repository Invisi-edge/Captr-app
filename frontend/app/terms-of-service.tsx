import { useTheme } from '@/lib/theme-context';
import { premiumColors, radius, spacing } from '@/lib/premium-theme';
import { useRouter } from 'expo-router';
import { ArrowLeft, FileText, CheckCircle, AlertTriangle, Ban, CreditCard, Scale } from 'lucide-react-native';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const LAST_UPDATED = '12 February 2026';

interface SectionProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  children: React.ReactNode;
  colors: ReturnType<typeof premiumColors>;
}

function PolicySection({ icon, iconBg, title, children, colors }: SectionProps) {
  return (
    <View
      style={{
        backgroundColor: colors.cardBg,
        borderColor: colors.cardBorder,
        borderWidth: 1,
        borderRadius: radius.xl,
        padding: spacing.xl,
        marginBottom: spacing.lg,
        ...colors.shadow.sm,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: iconBg,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          {icon}
        </View>
        <Text
          style={{
            color: colors.text,
            fontSize: 16,
            fontWeight: '700',
            flex: 1,
          }}
        >
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

function BulletPoint({ text, colors }: { text: string; colors: ReturnType<typeof premiumColors> }) {
  return (
    <View style={{ flexDirection: 'row', marginBottom: 8, paddingRight: spacing.md }}>
      <View
        style={{
          width: 5,
          height: 5,
          borderRadius: 3,
          backgroundColor: colors.accent,
          marginTop: 7,
          marginRight: 10,
          flexShrink: 0,
        }}
      />
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: 13,
          lineHeight: 20,
          fontWeight: '500',
          flex: 1,
        }}
      >
        {text}
      </Text>
    </View>
  );
}

function Paragraph({ text, colors }: { text: string; colors: ReturnType<typeof premiumColors> }) {
  return (
    <Text
      style={{
        color: colors.textSecondary,
        fontSize: 13,
        lineHeight: 20,
        fontWeight: '500',
        marginBottom: 8,
      }}
    >
      {text}
    </Text>
  );
}

export default function TermsOfServiceScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const colors = premiumColors(isDark);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: spacing['4xl'] }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={{
            paddingHorizontal: spacing['2xl'],
            paddingTop: spacing.xl,
            paddingBottom: spacing.xl,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              alignSelf: 'flex-start',
              paddingHorizontal: 14,
              paddingVertical: 10,
              gap: 6,
              backgroundColor: colors.glassBg,
              borderColor: colors.glassBorder,
              borderWidth: 1,
              borderRadius: radius.md,
              marginBottom: spacing['2xl'],
              ...colors.shadow.sm,
            }}
          >
            <ArrowLeft size={16} color={colors.text} />
            <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600' }}>Back</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: colors.accentSoft,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: `${colors.accent}20`,
              }}
            >
              <FileText size={22} color={colors.accent} />
            </View>
            <View>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 26,
                  fontWeight: '800',
                  letterSpacing: -0.7,
                }}
              >
                Terms of Service
              </Text>
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: 12,
                  fontWeight: '500',
                  marginTop: 2,
                }}
              >
                Last updated: {LAST_UPDATED}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: spacing['2xl'] }}>
          {/* Introduction */}
          <View
            style={{
              backgroundColor: colors.accentSoft,
              borderRadius: radius.xl,
              padding: spacing.xl,
              marginBottom: spacing.lg,
              borderWidth: 1,
              borderColor: `${colors.accent}20`,
            }}
          >
            <Text
              style={{
                color: colors.text,
                fontSize: 14,
                lineHeight: 22,
                fontWeight: '500',
              }}
            >
              By downloading, installing, or using Captr, you agree to be bound by these Terms of Service. Please read them carefully before using the app.
            </Text>
          </View>

          {/* Acceptance */}
          <PolicySection
            icon={<CheckCircle size={18} color={colors.success} />}
            iconBg={colors.successSoft}
            title="Acceptance of Terms"
            colors={colors}
          >
            <Paragraph
              text="By creating an account or using Captr, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy."
              colors={colors}
            />
            <Paragraph
              text="If you do not agree to these terms, please do not use the app. You must be at least 18 years old to use Captr."
              colors={colors}
            />
          </PolicySection>

          {/* Service Description */}
          <PolicySection
            icon={<FileText size={18} color={colors.accent} />}
            iconBg={colors.accentSoft}
            title="Service Description"
            colors={colors}
          >
            <Paragraph text="Captr provides the following services:" colors={colors} />
            <BulletPoint text="Business card scanning using AI-powered OCR (Optical Character Recognition)." colors={colors} />
            <BulletPoint text="Automatic extraction and organisation of contact information." colors={colors} />
            <BulletPoint text="Contact management and storage." colors={colors} />
            <BulletPoint text="AI-powered chatbot assistant (Pro feature)." colors={colors} />
            <BulletPoint text="Export functionality for contacts (Pro feature)." colors={colors} />
            <BulletPoint text="Cloud backup and synchronisation (Pro feature)." colors={colors} />
          </PolicySection>

          {/* User Responsibilities */}
          <PolicySection
            icon={<AlertTriangle size={18} color={colors.warning} />}
            iconBg={colors.warningSoft}
            title="User Responsibilities"
            colors={colors}
          >
            <Paragraph text="When using Captr, you agree to:" colors={colors} />
            <BulletPoint text="Provide accurate and complete information when creating your account." colors={colors} />
            <BulletPoint text="Keep your account credentials secure and not share them with others." colors={colors} />
            <BulletPoint text="Only scan business cards that you have obtained legitimately." colors={colors} />
            <BulletPoint text="Not use the app for any illegal or unauthorised purpose." colors={colors} />
            <BulletPoint text="Not attempt to reverse-engineer, modify, or interfere with the app's operation." colors={colors} />
            <BulletPoint text="Comply with all applicable local, state, national, and international laws." colors={colors} />
          </PolicySection>

          {/* Subscriptions & Payments */}
          <PolicySection
            icon={<CreditCard size={18} color={colors.info} />}
            iconBg={colors.infoSoft}
            title="Subscriptions & Payments"
            colors={colors}
          >
            <BulletPoint text="Captr offers a free tier with limited features. Pro subscriptions with full access will be available in a future update." colors={colors} />
            <BulletPoint text="When available, Pro subscriptions will be offered as Monthly and Yearly plans." colors={colors} />
            <BulletPoint text="All payments will be processed securely through our payment provider. We do not store your payment details." colors={colors} />
            <BulletPoint text="Subscriptions will provide access for the purchased duration." colors={colors} />
            <BulletPoint text="Refund requests can be made within 7 days of purchase by contacting support@captr.app. Refunds are processed at our discretion." colors={colors} />
            <BulletPoint text="We reserve the right to change pricing with prior notice to existing subscribers." colors={colors} />
          </PolicySection>

          {/* Prohibited Use */}
          <PolicySection
            icon={<Ban size={18} color={colors.danger} />}
            iconBg={colors.dangerSoft}
            title="Prohibited Activities"
            colors={colors}
          >
            <Paragraph text="You may not use Captr to:" colors={colors} />
            <BulletPoint text="Collect personal data without the knowledge or consent of the data subject." colors={colors} />
            <BulletPoint text="Send unsolicited messages (spam) using extracted contact information." colors={colors} />
            <BulletPoint text="Engage in data harvesting, scraping, or bulk collection of business card data." colors={colors} />
            <BulletPoint text="Upload malicious content, viruses, or harmful code." colors={colors} />
            <BulletPoint text="Impersonate another person or entity." colors={colors} />
            <BulletPoint text="Violate any applicable data protection laws including the DPDP Act, 2023." colors={colors} />
          </PolicySection>

          {/* Limitation of Liability */}
          <PolicySection
            icon={<Scale size={18} color={colors.accent} />}
            iconBg={colors.accentSoft}
            title="Limitation of Liability"
            colors={colors}
          >
            <BulletPoint text="Captr is provided 'as is' without warranties of any kind, express or implied." colors={colors} />
            <BulletPoint text="We do not guarantee 100% accuracy of OCR text extraction. Always verify extracted information." colors={colors} />
            <BulletPoint text="We are not liable for any indirect, incidental, or consequential damages arising from your use of the app." colors={colors} />
            <BulletPoint text="Our total liability is limited to the amount you paid for the service in the preceding 12 months." colors={colors} />
            <BulletPoint text="We reserve the right to suspend or terminate accounts that violate these terms." colors={colors} />
          </PolicySection>

          {/* Governing Law */}
          <PolicySection
            icon={<Scale size={18} color={colors.info} />}
            iconBg={colors.infoSoft}
            title="Governing Law"
            colors={colors}
          >
            <Paragraph
              text="These Terms of Service are governed by and construed in accordance with the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in India."
              colors={colors}
            />
            <Paragraph
              text="If any provision of these terms is found to be unenforceable, the remaining provisions will continue in full force and effect."
              colors={colors}
            />
          </PolicySection>

          {/* Contact */}
          <View
            style={{
              backgroundColor: colors.cardBg,
              borderColor: colors.cardBorder,
              borderWidth: 1,
              borderRadius: radius.xl,
              padding: spacing.xl,
              marginBottom: spacing.lg,
              ...colors.shadow.sm,
            }}
          >
            <Text style={{ color: colors.text, fontSize: 14, fontWeight: '700', marginBottom: 8 }}>
              Questions about these terms?
            </Text>
            <View
              style={{
                backgroundColor: colors.bgSubtle,
                borderRadius: radius.lg,
                padding: spacing.lg,
              }}
            >
              <Text style={{ color: colors.accent, fontSize: 14, fontWeight: '700' }}>
                support@captr.app
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4, fontWeight: '500' }}>
                Captr App | India
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={{ alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.xl }}>
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 11,
                fontWeight: '500',
                textAlign: 'center',
                lineHeight: 18,
              }}
            >
              By using Captr, you agree to these Terms of Service.{'\n'}
              We may update these terms from time to time.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
