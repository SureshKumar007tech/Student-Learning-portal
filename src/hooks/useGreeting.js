import { useMemo } from "react";
import { useDebugValue } from "react";

function useGreeting(name) {
  const greeting = useMemo(() => `Welcome, ${name || "Student"}!`, [name]);

  useDebugValue(greeting);

  return greeting;
}

export default useGreeting;