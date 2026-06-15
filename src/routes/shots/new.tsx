import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StarRating } from "@/components/ui/star-rating"
import { InputField, TextareaField } from "@/components/FormField"
import { getActiveBeans } from "@/lib/server/beans"
import { getRecipes } from "@/lib/server/recipes"
import { getTasteTags } from "@/lib/server/taste-tags"
import {
  createShot,
  getPreviousShotBySetup,
  getPrefillRecipe,
  getRecentlyUsedBeans,
} from "@/lib/server/shots"
import { cn } from "@/lib/utils"
import { Play, Pause, RotateCcw, History } from "lucide-react"

export const Route = createFileRoute("/shots/new")({
  loader: async () => {
    const [beans, recipes, tasteTags, recentBeans] = await Promise.all([
      getActiveBeans(),
      getRecipes(),
      getTasteTags(),
      getRecentlyUsedBeans(),
    ])
    return { beans, recipes, tasteTags, recentBeans }
  },
  component: NewShotPage,
})

function NewShotPage() {
  const { beans, recipes, tasteTags, recentBeans } = Route.useLoaderData()
  const navigate = useNavigate()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTags, setSelectedTags] = useState<number[]>([])

  const [timerSeconds, setTimerSeconds] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timerInterval, setTimerIntervalState] = useState<NodeJS.Timeout | null>(null)

  const [formData, setFormData] = useState({
    beanId: "",
    recipeId: "",
    doseGrams: "",
    yieldGrams: "",
    grindSetting: "",
    waterTempCelsius: "",
    pressure: "",
    rating: 3,
    notes: "",
  })

  const startTimer = () => {
    if (isTimerRunning) return
    setIsTimerRunning(true)
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1)
    }, 1000)
    setTimerIntervalState(interval)
  }

  const stopTimer = () => {
    if (!isTimerRunning) return
    setIsTimerRunning(false)
    if (timerInterval) {
      clearInterval(timerInterval)
      setTimerIntervalState(null)
    }
  }

  const resetTimer = () => {
    stopTimer()
    setTimerSeconds(0)
  }

  const toggleTag = (tagId: number) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    )
  }

  const handleBeanSelect = async (beanId: string | null) => {
    const id = beanId ?? ""
    setFormData((prev) => ({ ...prev, beanId: id }))
    if (id) {
      const recipeId = await getPrefillRecipe({ data: Number(id) })
      if (recipeId) {
        setFormData((prev) => ({ ...prev, beanId: id, recipeId: String(recipeId) }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await createShot({
        data: {
          beanId: formData.beanId ? Number(formData.beanId) : undefined,
          recipeId: formData.recipeId ? Number(formData.recipeId) : undefined,
          doseGrams: formData.doseGrams || undefined,
          yieldGrams: formData.yieldGrams || undefined,
          brewTimeSeconds: timerSeconds || undefined,
          grindSetting: formData.grindSetting || undefined,
          waterTempCelsius: formData.waterTempCelsius || undefined,
          pressure: formData.pressure || undefined,
          rating: formData.rating,
          notes: formData.notes || undefined,
          tasteTagIds: selectedTags.length > 0 ? selectedTags : undefined,
        },
      })
      navigate({ to: "/shots" })
    } catch {
      toast.error("Could not save this shot")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const negativeTags = tasteTags.filter((t) => t.category === "negative")
  const positiveTags = tasteTags.filter((t) => t.category === "positive")

  const selectedRecipe = recipes.find((r) => String(r.id) === formData.recipeId)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Log Shot</h1>
        <p className="text-muted-foreground">
          Record your espresso extraction
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Beans</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentBeans.length > 0 && !formData.beanId && (
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs">Recently used</Label>
                <div className="flex flex-wrap gap-2">
                  {recentBeans.map((bean) => (
                    <Badge
                      key={bean.id}
                      variant="outline"
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => handleBeanSelect(String(bean.id))}
                    >
                      {bean.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="bean">Select Beans</Label>
              <Select
                value={formData.beanId || undefined}
                onValueChange={handleBeanSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select beans" />
                </SelectTrigger>
                <SelectContent>
                  {beans.map((bean) => (
                    <SelectItem key={bean.id} value={String(bean.id)}>
                      {bean.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recipe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipe">Select Recipe</Label>
              <Select
                value={formData.recipeId || undefined}
                onValueChange={(v) => setFormData({ ...formData, recipeId: v ?? "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select recipe" />
                </SelectTrigger>
                <SelectContent>
                  {recipes.map((recipe) => (
                    <SelectItem key={recipe.id} value={String(recipe.id)}>
                      {recipe.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedRecipe && selectedRecipe.gear.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedRecipe.gear.map((rg) => (
                  <Badge key={rg.id} variant="secondary">
                    {rg.gear.name}
                  </Badge>
                ))}
              </div>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!formData.beanId || !formData.recipeId}
              onClick={async () => {
                const prevShot = await getPreviousShotBySetup({
                  data: {
                    beanId: formData.beanId ? Number(formData.beanId) : undefined,
                    recipeId: formData.recipeId ? Number(formData.recipeId) : undefined,
                  },
                })
                if (prevShot) {
                  setFormData((prev) => ({
                    ...prev,
                    doseGrams: prevShot.doseGrams ?? "",
                    yieldGrams: prevShot.yieldGrams ?? "",
                    grindSetting: prevShot.grindSetting ?? "",
                    waterTempCelsius: prevShot.waterTempCelsius ?? "",
                    pressure: prevShot.pressure ?? "",
                  }))
                  if (prevShot.brewTimeSeconds) {
                    setTimerSeconds(prevShot.brewTimeSeconds)
                  }
                }
              }}
            >
              <History className="size-4 mr-2" />
              Load from previous shot
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Extraction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              <InputField
                id="dose"
                label="Dose (g)"
                placeholder="18.0"
                value={formData.doseGrams}
                onChange={(value) => setFormData({ ...formData, doseGrams: value })}
              />
              <InputField
                id="yield"
                label="Yield (g)"
                placeholder="36.0"
                value={formData.yieldGrams}
                onChange={(value) => setFormData({ ...formData, yieldGrams: value })}
              />
              <InputField
                id="grindSetting"
                label="Grind Setting"
                placeholder="e.g., 15"
                value={formData.grindSetting}
                onChange={(value) => setFormData({ ...formData, grindSetting: value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Brew Time</Label>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-mono font-bold tabular-nums">
                  {formatTime(timerSeconds)}
                </div>
                <div className="flex gap-2">
                  {!isTimerRunning ? (
                    <Button type="button" size="icon" onClick={startTimer}>
                      <Play className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button type="button" size="icon" onClick={stopTimer}>
                      <Pause className="h-4 w-4" />
                    </Button>
                  )}
                  <Button type="button" size="icon" variant="outline" onClick={resetTimer}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                id="temp"
                label="Water Temp (°C)"
                placeholder="93.0"
                value={formData.waterTempCelsius}
                onChange={(value) => setFormData({ ...formData, waterTempCelsius: value })}
              />
              <InputField
                id="pressure"
                label="Pressure (bar)"
                placeholder="9.0"
                value={formData.pressure}
                onChange={(value) => setFormData({ ...formData, pressure: value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasting Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Rating</Label>
              <StarRating
                value={formData.rating}
                onChange={(rating) => setFormData({ ...formData, rating })}
              />
            </div>

            {negativeTags.length > 0 && (
              <div className="space-y-2">
                <Label className="text-destructive">Issues</Label>
                <div className="flex flex-wrap gap-2">
                  {negativeTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={selectedTags.includes(tag.id) ? "destructive" : "outline"}
                      className={cn(
                        "cursor-pointer transition-colors",
                        selectedTags.includes(tag.id)
                          ? ""
                          : "hover:bg-destructive/10"
                      )}
                      onClick={() => toggleTag(tag.id)}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {positiveTags.length > 0 && (
              <div className="space-y-2">
                <Label className="text-primary">Positives</Label>
                <div className="flex flex-wrap gap-2">
                  {positiveTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer transition-colors",
                        selectedTags.includes(tag.id)
                          ? ""
                          : "hover:bg-primary/10"
                      )}
                      onClick={() => toggleTag(tag.id)}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <TextareaField
              id="notes"
              label="Notes"
              placeholder="How was it? Any observations?"
              value={formData.notes}
              onChange={(value) => setFormData({ ...formData, notes: value })}
            />
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: "/shots" })}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? "Saving..." : "Save Shot"}
          </Button>
        </div>
      </form>
    </div>
  )
}
