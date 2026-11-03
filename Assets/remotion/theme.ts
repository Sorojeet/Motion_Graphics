import { loadFont } from "./fonts";
import theme from "../theme/theme.json";
loadFont();
export const c = theme.colors;
export const HEADING = theme.fonts.heading;
export const BODY = theme.fonts.body;
export const safeZone = (w: number, h: number) => (h > w ? theme.safeZone916 : theme.safeZone169);
