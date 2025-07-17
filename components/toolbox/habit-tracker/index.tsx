"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Plus, Trash2, CheckCircle, Circle, Target, Flame } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Habit {
  id: string
  name: string
  description: string
  target: number // target completions per week
  color: string
  createdAt: string
}

interface HabitCompletion {
  habitId: string
  date: string
}

const colors = [
  "#3B82F6", // blue
  "#EF4444", // red
  "#10B981", // green
  "#F59E0B", // yellow
  "#8B5CF6", // purple
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#84CC16", // lime
]

export function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [completions, setCompletions] = useState<HabitCompletion[]>([])
  const [newHabitName, setNewHabitName] = useState("")
  const [newHabitDescription, setNewHabitDescription] = useState("")
  const [newHabitTarget, setNewHabitTarget] = useState(7)
  const [selectedWeek, setSelectedWeek] = useState(0) // 0 = current week, -1 = last week, etc.
  
  const { toast } = useToast()

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedHabits = localStorage.getItem("mockify-habits")
    if (savedHabits) {
      setHabits(JSON.parse(savedHabits))
    }
    
    const savedCompletions = localStorage.getItem("mockify-habit-completions")
    if (savedCompletions) {
      setCompletions(JSON.parse(savedCompletions))
    }
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("mockify-habits", JSON.stringify(habits))
  }, [habits])

  useEffect(() => {
    localStorage.setItem("mockify-habit-completions", JSON.stringify(completions))
  }, [completions])

  const addHabit = () => {
    if (!newHabitName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a habit name",
        variant: "destructive",
      })
      return
    }

    const newHabit: Habit = {
      id: Date.now().toString(),
      name: newHabitName.trim(),
      description: newHabitDescription.trim(),
      target: newHabitTarget,
      color: colors[habits.length % colors.length],
      createdAt: new Date().toISOString()
    }

    setHabits([...habits, newHabit])
    setNewHabitName("")
    setNewHabitDescription("")
    setNewHabitTarget(7)
    
    toast({
      title: "Success",
      description: "Habit added successfully",
    })
  }

  const deleteHabit = (id: string) => {
    setHabits(habits.filter(habit => habit.id !== id))
    setCompletions(completions.filter(completion => completion.habitId !== id))
    toast({
      title: "Deleted",
      description: "Habit removed",
    })
  }

  const getWeekDates = (weekOffset: number = 0) => {
    const today = new Date()
    const currentDay = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - currentDay + 1 + (weekOffset * 7))
    
    const dates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday)
      date.setDate(monday.getDate() + i)
      dates.push(date.toISOString().split('T')[0])
    }
    return dates
  }

  const toggleHabitCompletion = (habitId: string, date: string) => {
    const existing = completions.find(c => c.habitId === habitId && c.date === date)
    
    if (existing) {
      setCompletions(completions.filter(c => !(c.habitId === habitId && c.date === date)))
    } else {
      setCompletions([...completions, { habitId, date }])
    }
  }

  const isHabitCompleted = (habitId: string, date: string) => {
    return completions.some(c => c.habitId === habitId && c.date === date)
  }

  const getHabitWeeklyStats = (habitId: string, weekOffset: number = 0) => {
    const weekDates = getWeekDates(weekOffset)
    const completed = weekDates.filter(date => isHabitCompleted(habitId, date)).length
    const habit = habits.find(h => h.id === habitId)
    const target = habit?.target || 7
    return { completed, target, percentage: Math.round((completed / target) * 100) }
  }

  const getOverallStats = () => {
    const weekDates = getWeekDates(selectedWeek)
    const totalTargets = habits.reduce((sum, habit) => sum + habit.target, 0)
    const totalCompleted = habits.reduce((sum, habit) => {
      return sum + weekDates.filter(date => isHabitCompleted(habit.id, date)).length
    }, 0)
    
    return {
      totalCompleted,
      totalTargets,
      percentage: totalTargets > 0 ? Math.round((totalCompleted / totalTargets) * 100) : 0
    }
  }

  const weekDates = getWeekDates(selectedWeek)
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const overallStats = getOverallStats()

  const getWeekLabel = (offset: number) => {
    if (offset === 0) return "This Week"
    if (offset === -1) return "Last Week"
    return `${Math.abs(offset)} weeks ago`
  }

  const getCurrentStreak = (habitId: string) => {
    let streak = 0
    const today = new Date()
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      if (isHabitCompleted(habitId, dateStr)) {
        streak++
      } else {
        break
      }
    }
    
    return streak
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="h-8 w-8 text-orange-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Habit Tracker</h1>
          <p className="text-gray-600">Build and track daily habits to improve your productivity and wellness</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        {/* Overall Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Overall Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {overallStats.percentage}%
              </div>
              <div className="text-sm text-gray-600 mb-3">
                {overallStats.totalCompleted} of {overallStats.totalTargets} targets
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 bg-orange-500 rounded-full transition-all"
                  style={{ width: `${overallStats.percentage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Habit */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Habit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="habitName">Habit Name</Label>
                <Input
                  id="habitName"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="Exercise, Read, Meditate..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="habitDescription">Description</Label>
                <Input
                  id="habitDescription"
                  value={newHabitDescription}
                  onChange={(e) => setNewHabitDescription(e.target.value)}
                  placeholder="Optional details..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="habitTarget">Weekly Target</Label>
                <Input
                  id="habitTarget"
                  type="number"
                  min="1"
                  max="7"
                  value={newHabitTarget}
                  onChange={(e) => setNewHabitTarget(parseInt(e.target.value) || 1)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <Button onClick={addHabit} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Habit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Week Navigation */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Weekly Habit Tracker</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedWeek(selectedWeek - 1)}
              >
                ← Previous
              </Button>
              <span className="text-sm font-medium min-w-[100px] text-center">
                {getWeekLabel(selectedWeek)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedWeek(selectedWeek + 1)}
                disabled={selectedWeek >= 0}
              >
                Next →
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {habits.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Add your first habit to start tracking</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Calendar Header */}
              <div className="grid grid-cols-8 gap-2">
                <div className="p-2"></div>
                {dayNames.map((day, index) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                    <div>{day}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(weekDates[index]).getDate()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Habits Grid */}
              {habits.map((habit) => {
                const stats = getHabitWeeklyStats(habit.id, selectedWeek)
                const streak = getCurrentStreak(habit.id)
                
                return (
                  <div key={habit.id} className="grid grid-cols-8 gap-2 items-center">
                    <div className="p-2 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm text-gray-900">{habit.name}</h3>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteHabit(habit.id)}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      {habit.description && (
                        <p className="text-xs text-gray-500">{habit.description}</p>
                      )}
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-600">
                          {stats.completed}/{stats.target}
                        </span>
                        {streak > 0 && (
                          <span className="flex items-center gap-1 text-orange-600">
                            <Flame className="w-3 h-3" />
                            {streak}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {weekDates.map((date) => {
                      const isCompleted = isHabitCompleted(habit.id, date)
                      const isPastDate = new Date(date) < new Date(new Date().toISOString().split('T')[0])
                      
                      return (
                        <button
                          key={date}
                          onClick={() => toggleHabitCompletion(habit.id, date)}
                          className="p-2 flex items-center justify-center hover:bg-gray-50 rounded-md transition-colors"
                          disabled={selectedWeek < 0 && !isPastDate && new Date(date) > new Date()}
                        >
                          {isCompleted ? (
                            <CheckCircle
                              className="w-6 h-6 transition-colors"
                              style={{ color: habit.color }}
                            />
                          ) : (
                            <Circle className="w-6 h-6 text-gray-300 hover:text-gray-400 transition-colors" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Habit Statistics */}
      {habits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Habit Statistics</CardTitle>
            <CardDescription>Performance overview for {getWeekLabel(selectedWeek).toLowerCase()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {habits.map((habit) => {
                const stats = getHabitWeeklyStats(habit.id, selectedWeek)
                const streak = getCurrentStreak(habit.id)
                
                return (
                  <div key={habit.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">{habit.name}</h3>
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: habit.color }}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Completed</span>
                        <span className="font-medium">{stats.completed}/{stats.target}</span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            backgroundColor: habit.color,
                            width: `${Math.min(stats.percentage, 100)}%`
                          }}
                        />
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Success Rate</span>
                        <span className="font-medium">{stats.percentage}%</span>
                      </div>
                      
                      {streak > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Current Streak</span>
                          <span className="font-medium text-orange-600 flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            {streak} days
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
