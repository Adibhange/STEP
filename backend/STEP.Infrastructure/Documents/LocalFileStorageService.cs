using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using STEP.Application.Common.Interfaces;

namespace STEP.Infrastructure.Documents
{
    /// <summary>Writes candidate documents to local disk under FileStorage:BasePath (default: App_Data/uploads).</summary>
    public class LocalFileStorageService(IConfiguration configuration) : IFileStorageService
    {
        public string ProviderName => "Local";

        private string BasePath => configuration["FileStorage:BasePath"] ?? Path.Combine(Directory.GetCurrentDirectory(), "App_Data", "uploads");

        public async Task<string> SaveAsync(string relativeFolder, string fileName, Stream content, CancellationToken cancellationToken = default)
        {
            var folder = Path.Combine(BasePath, relativeFolder);
            Directory.CreateDirectory(folder);

            var safeFileName = $"{Guid.NewGuid():N}_{Path.GetFileName(fileName)}";
            var fullPath = Path.Combine(folder, safeFileName);

            await using (var fileStream = new FileStream(fullPath, FileMode.Create, FileAccess.Write))
            {
                await content.CopyToAsync(fileStream, cancellationToken);
            }

            return Path.Combine(relativeFolder, safeFileName).Replace('\\', '/');
        }

        public async Task<byte[]> ReadAsync(string relativePath, CancellationToken cancellationToken = default)
        {
            var fullPath = Path.Combine(BasePath, relativePath.Replace('/', Path.DirectorySeparatorChar));
            return await File.ReadAllBytesAsync(fullPath, cancellationToken);
        }
    }
}
