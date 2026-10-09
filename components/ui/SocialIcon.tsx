import { DribbbleLogo, GithubLogo, InstagramLogo, LinkedinLogo, XLogo } from "@phosphor-icons/react/dist/ssr";
import type { SocialLink } from "@/data/profile";

const icons = {
  github: GithubLogo,
  linkedin: LinkedinLogo,
  instagram: InstagramLogo,
  x: XLogo,
  dribbble: DribbbleLogo,
} as const;

export function SocialIcon({ icon, size = 20 }: { icon: SocialLink["icon"]; size?: number }) {
  const Icon = icons[icon];
  return <Icon size={size} weight="fill" aria-hidden="true" />;
}
