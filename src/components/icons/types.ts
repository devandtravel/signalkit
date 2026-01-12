import type React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
  size?: number | string;
}
