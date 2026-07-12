// Baby Dawn illustration — the owner-supplied mother-and-baby line
// drawing, vector-traced from the original and recolored to the brand's
// rose-gold gradient. Lives as a static asset in /public.
export function MotherMark({ height = 150 }: { height?: number }) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}mother.svg`}
      height={height}
      alt=""
      aria-hidden="true"
      style={{ width: "auto", height }}
    />
  );
}
