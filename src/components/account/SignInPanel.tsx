"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowRight, FlaskConical, Mail, UserRound } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { applyApiError } from "@/components/forms/applyApiError";
import { fieldA11y, FormField } from "@/components/forms/FormField";
import { useErrorText } from "@/components/forms/useErrorText";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { useRouter } from "@/i18n/navigation";
import { requestSignInCode, signInDemo, signOut, verifySignInCode } from "@/lib/api/account";
import { signInCodeSchema, signInEmailSchema } from "@/lib/validation/account";
import { useDemoSession } from "@/stores/hydration";
import { toast } from "@/stores/toast";

/** Only send people back to an account page (no open redirects). */
const safeNext = (next: string | null) => (next && /^\/account(\/[a-z-]*)?$/.test(next) ? next : "/account");

/** Demo sign-in: one-click demo customer, or a mock email + one-time code. Not real authentication. */
export function SignInPanel() {
  const t = useTranslations("signIn");
  const tToast = useTranslations("toast");
  const errorText = useErrorText();
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const { ready, session } = useDemoSession();
  const [demoBusy, setDemoBusy] = useState(false);
  const [sentTo, setSentTo] = useState<{ email: string; code: string } | null>(null);

  const emailForm = useForm<{ email: string }>({ resolver: zodResolver(signInEmailSchema), defaultValues: { email: "" } });
  const codeForm = useForm<{ code: string }>({ resolver: zodResolver(signInCodeSchema), defaultValues: { code: "" } });

  if (!ready) return <Skeleton className="h-96 rounded-card" />;

  if (session) {
    return (
      <div className="flex max-w-xl flex-col gap-5 rounded-card border border-line bg-bg-alt p-6 sm:p-8">
        <h2 className="text-xl font-medium">{t("signedInTitle")}</h2>
        <p className="text-sm text-muted">{session.email ? t("signedInAs", { email: session.email }) : t("signedInDemo")}</p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href={next} icon={<ArrowRight aria-hidden className="size-4" />}>
            {t("goToAccount")}
          </ButtonLink>
          <Button variant="outline" onClick={() => signOut()}>
            {t("signOut")}
          </Button>
        </div>
      </div>
    );
  }

  const continueDemo = async () => {
    setDemoBusy(true);
    try {
      await signInDemo();
      router.push(next);
    } catch {
      setDemoBusy(false);
      toast({ tone: "error", title: tToast("errorTitle"), body: tToast("errorBody") });
    }
  };

  const requestCode = emailForm.handleSubmit(async ({ email }) => {
    const r = await requestSignInCode(email);
    setSentTo({ email: r.sentTo, code: r.demoCode });
  });

  const verify = codeForm.handleSubmit(async ({ code }) => {
    if (!sentTo) return;
    try {
      await verifySignInCode(sentTo.email, code);
      router.push(next);
    } catch (error) {
      if (!applyApiError(error, codeForm.setError, { code: "code" })) toast({ tone: "error", title: tToast("errorTitle"), body: tToast("errorBody") });
    }
  });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="flex flex-col gap-4 rounded-card border border-ink bg-bg-alt p-6 sm:p-8">
        <UserRound aria-hidden className="size-7 text-accent-ink" />
        <h2 className="text-xl font-medium">{t("demoTitle")}</h2>
        <p className="text-sm text-muted">{t("demoBody")}</p>
        <Button size="lg" loading={demoBusy} loadingLabel={t("signingIn")} onClick={continueDemo} className="mt-auto self-start">
          {t("demoButton")}
        </Button>
      </section>

      <section className="flex flex-col gap-4 rounded-card border border-line bg-bg-alt p-6 sm:p-8">
        <Mail aria-hidden className="size-7 text-muted" />
        <h2 className="text-xl font-medium">{t("emailTitle")}</h2>
        {!sentTo ? (
          <form onSubmit={requestCode} noValidate className="flex flex-col gap-4">
            <p className="text-sm text-muted">{t("emailBody")}</p>
            <FormField id="signin-email" label={t("email")} error={errorText(emailForm.formState.errors.email)}>
              <Input type="email" autoComplete="email" inputMode="email" {...fieldA11y("signin-email", errorText(emailForm.formState.errors.email))} {...emailForm.register("email")} />
            </FormField>
            <Button type="submit" variant="outline" loading={emailForm.formState.isSubmitting} loadingLabel={t("sending")} className="self-start">
              {t("sendCode")}
            </Button>
          </form>
        ) : (
          <form onSubmit={verify} noValidate className="flex flex-col gap-4">
            <p className="flex items-start gap-2 rounded-2xl border border-info/25 bg-info/[0.06] px-4 py-3 text-sm text-info" role="status">
              <FlaskConical aria-hidden className="mt-0.5 size-4 shrink-0" />
              <span>{t("codeNotice", { email: sentTo.email, code: sentTo.code })}</span>
            </p>
            <FormField id="signin-code" label={t("code")} error={errorText(codeForm.formState.errors.code)}>
              <Input
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                className="tracking-[0.4em] tabular"
                {...fieldA11y("signin-code", errorText(codeForm.formState.errors.code))}
                {...codeForm.register("code")}
              />
            </FormField>
            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" loading={codeForm.formState.isSubmitting} loadingLabel={t("signingIn")}>
                {t("verify")}
              </Button>
              <Button variant="ghost" onClick={() => setSentTo(null)}>
                {t("changeEmail")}
              </Button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
