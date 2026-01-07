"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { WaveBackground } from "@/components/wave-background"
import { Mascot } from "@/components/mascot"
import { BookOpen, Flame, Trophy, Star, ChevronRight } from "lucide-react"
import { Navbar } from '@/components/layout/navbar'

interface DashboardScreenProps {
  onStartStudying: () => void
}

export default function DashboardScreen({ onStartStudying }: DashboardScreenProps) {
  const currentLevel = "N5"
  const progressPercent = 65
  const proficiencyPoints = 1250
  const streakDays = 7
  const wordsLearned = 127

  return (
    <>
      <Navbar />

        {/* Main Content */}
        <main className="flex-1 px-6 pt-4 pb-24">
          <Card className="shadow-lg border-3 border-primary/60 overflow-hidden rounded-3xl bg-card/95 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Current Level</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-(--font-cherry-bomb) text-4xl text-primary">{currentLevel}</span>
                    <span className="text-sm text-primary bg-primary/15 px-3 py-1 rounded-full font-medium">
                      Beginner
                    </span>
                  </div>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border-2 border-dashed border-primary/40 flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-primary" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress to N4</span>
                  <span className="font-semibold text-primary">{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} className="h-3 rounded-full" />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <Card className="shadow-md border-2 border-primary/50 rounded-2xl hover:border-primary transition-colors hover:shadow-lg">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-accent border-2 border-dashed border-primary/30 flex items-center justify-center">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-(--font-cherry-bomb) text-2xl text-foreground">
                    {proficiencyPoints.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Proficiency Points</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md border-2 border-primary/50 rounded-2xl hover:border-primary transition-colors hover:shadow-lg">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-accent border-2 border-dashed border-primary/30 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-(--font-cherry-bomb) text-2xl text-foreground">{wordsLearned}</p>
                  <p className="text-xs text-muted-foreground">Words Learned</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 space-y-3">
            <h3 className="font-semibold text-foreground">Continue Learning</h3>

            <Card
              className="shadow-md border-2 border-primary/50 rounded-2xl hover:border-primary hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              onClick={onStartStudying}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-md">
                    <span className="text-primary-foreground text-2xl">漢</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Kanji Basics</p>
                    <p className="text-sm text-muted-foreground">12 cards remaining</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-primary" />
              </CardContent>
            </Card>

            <Card className="shadow-md border-2 border-primary/30 rounded-2xl hover:shadow-lg transition-all cursor-pointer opacity-70">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
                    <span className="text-secondary-foreground text-2xl">あ</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Hiragana Practice</p>
                    <p className="text-sm text-muted-foreground">Completed today ✓</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </div>
        </main>
    </>
  )
}
