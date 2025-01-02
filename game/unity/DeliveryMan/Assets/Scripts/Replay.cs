using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;

public class Replay : MonoBehaviour
{
    public void ReplayGame() {
        SceneManager.LoadScene("PlayScene");
        RemainPackages.ResetRemainPackages();
        TimeRecord.ResetTimer();
    }
}
