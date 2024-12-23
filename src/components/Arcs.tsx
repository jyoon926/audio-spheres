export default function Arcs() {
  return (
    <div className="z-[-1] absolute inset-0 flex justify-center items-start overflow-hidden">
      {[...Array(11)].map((_, i) => (
        <div
          className="absolute w-[700vw] h-[700vw] top-[15vh] rounded-full border-[1.5rem] border-glass translate-y-[100vh] bob"
          style={{ animationDelay: (i * 0.8 - 3) + "s", opacity: 1 - 0.19 * Math.abs(5 - i) }}
          key={i}
        ></div>
      ))}
    </div>
  );
}
