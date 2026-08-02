export const PRODUCT = {
  name: "Ava Rack",
  origin: "https://ava-rack.yhay81.com",
  description: "所持アバターごとにBOOTHの衣装・髪型・小物検索を組み立てる。",
  repository: "https://github.com/yhay81/ava-rack",
  dataRetentionDays: 35,
} as const;

export const EVENT_NAMES = [
  "visited",
  "routes_built",
  "booth_opened",
  "avatar_saved",
  "returned",
] as const;

export type EventName = (typeof EVENT_NAMES)[number];
