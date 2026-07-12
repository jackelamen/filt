// Baby Dawn illustration — the owner-supplied mother-and-baby line
// drawing, vector-traced from the original (potrace) and recolored to
// the brand's rose-gold gradient. Lives as a static asset in /public.
export function MotherMark({ width = 300 }: { width?: number }) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}mother2.svg`}
      alt=""
      aria-hidden="true"
      style={{ width, height: "auto", maxWidth: "100%" }}
    />
  );
}
