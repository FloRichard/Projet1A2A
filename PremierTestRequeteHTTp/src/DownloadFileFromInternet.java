import java.io.BufferedInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
 
  public class DownloadFileFromInternet {
 
    public static void main(String[] args){
 
    ///////////////////////////////////////////////////////// Parametrages des URL et du nom des fichiers  ////////////////////////////////	
    
      String url = "http://ade.unicaen.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?resources=37590&projectId=1&calType=ical\r\n";
      String file = "C:\\Users\\Alex\\Downloads\\ADE\\2235.ics";
      
      String url2 = "http://ade.unicaen.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?resources=38923&projectId=1&calType=ical\r\n";
      String file2 = "C:\\Users\\Alex\\Downloads\\ADE\\3250.ics";
 
      
     /////////////////////////////////////////////////////// 37590 : Salle 2235 //////////////////////////////////////////////////////////
      
      
      
      BufferedInputStream bufferedIS = null;
      FileOutputStream fileOS = null;
      try {
        URL urlObj = new URL(url);
        bufferedIS = new BufferedInputStream(urlObj.openStream());
        fileOS = new FileOutputStream(file);
 
        int data = bufferedIS.read();
        while(data != -1){
          fileOS.write(data);
          data = bufferedIS.read();
        }
      } catch (MalformedURLException e) {
        e.printStackTrace();
      } catch (IOException e) {
        e.printStackTrace();
      }finally{
        try {
          if(fileOS != null){
            fileOS.close();
          }
        } catch (IOException e) {
          e.printStackTrace();
        }
        try {
          if(bufferedIS != null){
            bufferedIS.close();
          }
        } catch (IOException e) {
          e.printStackTrace();
        }
        
        ///////////////////////////////////////////////////////////// 38923 : Salle 3250 /////////////////////////////////////////////
        
        
        BufferedInputStream bufferedIS2 = null;
        FileOutputStream fileOS2 = null;
        try {
          URL urlObj = new URL(url2);
          bufferedIS2 = new BufferedInputStream(urlObj.openStream());
          fileOS2 =new FileOutputStream(file2);
   
          int data = bufferedIS2.read();
          while(data != -1){
            fileOS2.write(data);
            data = bufferedIS2.read();
          }
        } catch (MalformedURLException e) {
          e.printStackTrace();
        } catch (IOException e) {
          e.printStackTrace();
        }finally{
          try {
            if(fileOS2 != null){
              fileOS2.close();
            }
          } catch (IOException e) {
            e.printStackTrace();
          }
          try {
            if(bufferedIS2 != null){
              bufferedIS.close();
            }
          } catch (IOException e) {
            e.printStackTrace();
          }
      }
    }
      
      ////////////////////////////////////////////////////// ...... ///////////////////////////////////////////////
    }
  }