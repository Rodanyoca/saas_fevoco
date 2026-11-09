export type LigueContactDraft = {
  clientKey?: string
  id: string
  idTypeActeur: string
  idActeur: string
  fonction: string
  principal: boolean
  statut: "ACTIF" | "INACTIF"
  observation: string
}

export type LigueContactActor = {
  id: string; nomComplet: string; telephone: string; email: string
}

export type LigueContactEditorData = {
  contacts: LigueContactDraft[]
  types: { id: string; label: string }[]
  actorsByType: Record<string, LigueContactActor[]>
  revision: string
}
