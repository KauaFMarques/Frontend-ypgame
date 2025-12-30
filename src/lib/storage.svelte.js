import { onMount } from 'svelte';

const useLocalStorage = (key) => {
  let value = $state();
  
  onMount(() => {
  	setTimeout(() => {
  		const currentValue = localStorage.getItem(key);
    	console.log("Current value: ", currentValue);
    	if (currentValue) value = JSON.parse(currentValue);
    	console.log("Running");
  	}, 500);
  });

  const save = () => {
    if (value) {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      localStorage.removeItem(key);
    }
  };

  return {
    get value() {
      return value;
    },
    set value(v) {
      console.log("Updated store");
      value = v;
      save();
    },
    push: (v) => {
      value.results.push(v);
      save(this);
    },
    increment: () => {
      value.score++;
      save(this);
    },
  };
};

export default useLocalStorage;
