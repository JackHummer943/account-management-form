import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export type Label = {
  text: string
}

export type Account = {
  labels: Label[],
  type: 'Local' | 'LDAP',
  login: string,
  password: string | null
}

export const useAccountsStore = defineStore('accounts', () => {
  const accounts = ref<Account[]>([]);

  const savedAccounts = localStorage.getItem('accounts');

  if (savedAccounts) {
    accounts.value = JSON.parse(savedAccounts);
  }

  watch(accounts, (newAccounts) => {
    localStorage.setItem('accounts', JSON.stringify(newAccounts));
  }, { deep: true });

  const addAccount = () => {
    accounts.value.push({
      labels: [],
      type: 'Local',
      login: '',
      password: '',
    })
  }

  const removeAccount = (index: number) => {
    accounts.value.splice(index, 1);
  }

  const updateAccount = (index: number, updates: Partial<Account>) => {
    Object.assign(accounts.value[index], updates);
  }

  return { accounts, addAccount, removeAccount, updateAccount };
})

