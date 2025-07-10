export default function DarkModeToggle({ toggle }) {
  return (
    <button
      onClick={toggle}
      className="text-sm px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 dark:text-white text-gray-800"
    >
      🌓 Toggle Theme
    </button>
  );
}
