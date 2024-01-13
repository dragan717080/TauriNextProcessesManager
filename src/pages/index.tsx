import { invoke } from "@tauri-apps/api/tauri"
import type { NextPage } from "next"
import Head from "next/head"
import Image from "next/image"
import { useCallback } from "react"
import { useGlobalShortcut } from "@/hooks/tauri/shortcuts"
import { SystemInfo, Processes } from "@/components"

const Home: NextPage = () => {
  const shortcutHandler = useCallback(() => {
    console.log("Ctrl+P was pressed!")
  }, [])
  useGlobalShortcut("CommandOrControl+P", shortcutHandler)

  return (
    <div>
      <SystemInfo />
      <Processes />
    </div>
  )
}

export default Home
