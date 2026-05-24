export default function PlaceholderScreen({ name, icon, description }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <div className="text-6xl mb-4">{icon}</div>
      <h2 className="text-2xl font-bold text-white mb-2">{name}</h2>
      <p className="text-gray-400 text-sm max-w-xs">{description}</p>
    </div>
  )
}
