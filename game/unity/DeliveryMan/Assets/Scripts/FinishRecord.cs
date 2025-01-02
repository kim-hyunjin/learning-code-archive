using System.Collections;
using System.Collections.Generic;
using UnityEngine;


public class FinishRecord : MonoBehaviour
{
    void Start()
    {
        GetComponent<TMPro.TextMeshProUGUI>().text = TimeRecord.GetFormattedTime();
    }
}
