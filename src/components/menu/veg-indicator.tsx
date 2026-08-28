export function VegIndicator({ isVeg }: { isVeg: boolean }) {
  return (
    <span
      className="inline-flex h-4 w-4 shrink-0 items-center justify-center border"
      style={{ borderColor: isVeg ? "#2f6d3a" : "#b3261e" }}
      role="img"
      aria-label={isVeg ? "Vegetarian" : "Non-vegetarian"}
      title={isVeg ? "Vegetarian" : "Non-vegetarian"}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: isVeg ? "#2f6d3a" : "#b3261e" }}
      />
    </span>
  );
}
