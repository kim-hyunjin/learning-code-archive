using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;

public class RemainPackages : MonoBehaviour
{
    static int remain = 6;

    void Update() {
        GetComponent<TMPro.TextMeshProUGUI>().text = "Remain: " + remain;
    }

    public static void MinusRemainPackage()
    {
        remain -= 1;

        if (remain == 0)
        {
            TimeRecord.updateTimer = false;
            SceneManager.LoadScene("GameOverScene");
        }
    }

    public static void ResetRemainPackages()
    {
        remain = 6;
    }

}
