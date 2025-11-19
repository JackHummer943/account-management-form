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

const validateLabel = (text: string) => text.length <= 50;
const validateLogin = (login: string) => login.trim().length > 0 && login.length <= 100;
const validatePassword = (password: string) => password.length <= 100;

export const useAccountsStore = defineStore('accounts', () => {
  const accounts = ref<Account[]>([])

  const saved = localStorage.getItem('accounts')
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      accounts.value = parsed.filter((acc: Account) => isValid(acc))
    } catch (e) {
      console.error('Ошибка загрузки accounts', e)
    }
  }

  watch(accounts, (newVal) => {
    const valid = newVal.filter(isValid)
    localStorage.setItem('accounts', JSON.stringify(valid))
  }, { deep: true })

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
    const current = accounts.value[index]
    if (!current) return false

    const candidate = { ...current, ...updates }
    if (!isValid(candidate)) return false

    Object.assign(current, updates)
    return true
  }

  function isValid(acc: Account): boolean {
    const loginOk = validateLogin(acc.login)
    const labelsOk = acc.labels.every(l => typeof l.text === 'string' && validateLabel(l.text))
    const passwordOk = acc.type === 'LDAP'
      ? acc.password === null
      : acc.password !== null && validatePassword(acc.password)

    return loginOk && labelsOk && passwordOk
  }

  return { accounts, addAccount, removeAccount, updateAccount }
})