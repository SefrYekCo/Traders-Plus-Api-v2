
buck2uni = {

            "n": "ن",
            "t": "ت",
            "a": "ا",
            "l": "ل",
            "b": "ب",
            "i": "ی",
            "s": "س",
            "sh": "ش",
            "ch": "چ",
            "j": "ج",
            "h": "ح",
            "kh": "خ",
            "H": "ه",
            "A": "ع",
            "gh": "غ",
            "f": "ف",
            "Gh": "ق",
            "S": "ث",
            "ss": "ص",
            "z": "ض",
            "m": "م",
            "k": "ک",
            "g": "گ",
            "Z": "ظ",
            "T": "ط",
            "ZZ": "ز",
            "r": "ر",
            "zz": "ذ",
            "d": "د",
            "p": "پ",
            "w": "و"


}
def transString(pref, string, reverse=0):

    for k, v in buck2uni.items():
      if not reverse:
            string = string.replace(v, k)
      else:
            string = string.replace(k, v)

    return (pref + " " + string)
