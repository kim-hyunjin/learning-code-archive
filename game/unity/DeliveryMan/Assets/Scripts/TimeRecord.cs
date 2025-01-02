using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;

public class TimeRecord : MonoBehaviour
{
    public static float time = 0f;
    public static bool updateTimer = false;

    TMPro.TextMeshProUGUI textUI;

    void Start()
    {
        updateTimer = true;
        textUI = GetComponent<TMPro.TextMeshProUGUI>();
    }

    void Update()
    {
        if (updateTimer) {
            time += Time.deltaTime;
            displayTime();
        }
        
    }

    public static string GetFormattedTime()
    {
        return TimeSpan.FromSeconds(time).ToString("mm\\:ss\\.fff");
    }

    public static void ResetTimer()
    {
        time = 0f;
    }

    private void displayTime()
    {
        
        textUI.text = GetFormattedTime();
    }
}
