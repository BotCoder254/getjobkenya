export { useAuth } from '../contexts/AuthContext';
export { useJobs } from '../contexts/JobContext';
export { usePermissions } from './usePermissions';
export { useRoleNavigation } from './useRoleNavigation';

export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}; 